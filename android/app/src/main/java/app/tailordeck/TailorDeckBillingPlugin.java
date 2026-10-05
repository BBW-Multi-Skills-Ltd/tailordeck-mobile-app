package app.tailordeck;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "TailorDeckBilling")
public class TailorDeckBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;
    private String pendingProductId;
    private String pendingBasePlanId;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .build();
    }

    @PluginMethod
    public void getBillingStatus(PluginCall call) {
        connectBillingClient(() -> {
            JSObject result = new JSObject();
            result.put("available", true);
            result.put("responseOkCode", BillingClient.BillingResponseCode.OK);
            call.resolve(result);
        }, call);
    }

    @PluginMethod
    public void purchaseSubscription(PluginCall call) {
        String productId = call.getString("productId");
        String basePlanId = call.getString("basePlanId");

        if (!isSupportedProduct(productId) || !isSupportedBasePlan(basePlanId)) {
            call.reject("Unsupported Google Play subscription product.");
            return;
        }

        if (pendingPurchaseCall != null) {
            call.reject("Another Google Play purchase is already in progress.");
            return;
        }

        pendingPurchaseCall = call;
        pendingProductId = productId;
        pendingBasePlanId = basePlanId;
        String oldPurchaseToken = call.getString("oldPurchaseToken");
        String obfuscatedAccountId = call.getString("obfuscatedAccountId");

        connectBillingClient(
            () -> queryAndLaunchPurchase(productId, basePlanId, oldPurchaseToken, obfuscatedAccountId),
            call
        );
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        if (pendingPurchaseCall == null) return;

        int responseCode = billingResult.getResponseCode();
        if (responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            JSObject result = new JSObject();
            result.put("status", "canceled");
            result.put("productId", pendingProductId);
            result.put("basePlanId", pendingBasePlanId);
            pendingPurchaseCall.resolve(result);
            clearPendingPurchase();
            return;
        }

        if (responseCode != BillingClient.BillingResponseCode.OK || purchases == null || purchases.isEmpty()) {
            rejectWithBillingResult(pendingPurchaseCall, billingResult);
            clearPendingPurchase();
            return;
        }

        Purchase purchase = purchases.get(0);
        JSObject result = toPurchaseObject(purchase);
        // A pending purchase (e.g. awaiting bank/cash confirmation) must not be verified until it completes.
        result.put("status", purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED ? "purchased" : "pending");
        result.put("productId", pendingProductId);
        result.put("basePlanId", pendingBasePlanId);
        pendingPurchaseCall.resolve(result);
        clearPendingPurchase();
    }

    @PluginMethod
    public void getActivePurchases(PluginCall call) {
        connectBillingClient(() -> {
            QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build();

            billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    rejectWithBillingResult(call, billingResult);
                    return;
                }

                JSArray items = new JSArray();
                if (purchases != null) {
                    for (Purchase purchase : purchases) {
                        String productId = purchase.getProducts().isEmpty() ? null : purchase.getProducts().get(0);
                        if (!isSupportedProduct(productId)) continue;
                        JSObject item = toPurchaseObject(purchase);
                        item.put("productId", productId);
                        items.put(item);
                    }
                }

                JSObject result = new JSObject();
                result.put("purchases", items);
                call.resolve(result);
            });
        }, call);
    }

    @PluginMethod
    public void openSubscriptionManagement(PluginCall call) {
        String productId = call.getString("productId");
        String url = "https://play.google.com/store/account/subscriptions?package=" + getContext().getPackageName();
        if (isSupportedProduct(productId)) url += "&sku=" + productId;

        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException error) {
            call.reject("Google Play is not available on this device.");
        }
    }

    @PluginMethod
    public void getSubscriptionPrices(PluginCall call) {
        connectBillingClient(() -> {
            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Arrays.asList(subscriptionProduct("tailordeck_starter"), subscriptionProduct("tailordeck_pro")))
                .build();

            billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsResult) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    rejectWithBillingResult(call, billingResult);
                    return;
                }

                JSArray prices = new JSArray();
                List<ProductDetails> productDetailsList = productDetailsResult.getProductDetailsList();
                if (productDetailsList != null) {
                    for (ProductDetails productDetails : productDetailsList) {
                        if (productDetails.getSubscriptionOfferDetails() == null) continue;
                        for (ProductDetails.SubscriptionOfferDetails offer : productDetails.getSubscriptionOfferDetails()) {
                            // Base plans have no offer id; promotional offers are skipped so the card shows the regular price.
                            if (offer.getOfferId() != null) continue;
                            List<ProductDetails.PricingPhase> phases = offer.getPricingPhases().getPricingPhaseList();
                            if (phases.isEmpty()) continue;
                            ProductDetails.PricingPhase phase = phases.get(phases.size() - 1);
                            JSObject price = new JSObject();
                            price.put("productId", productDetails.getProductId());
                            price.put("basePlanId", offer.getBasePlanId());
                            price.put("formattedPrice", phase.getFormattedPrice());
                            price.put("priceAmountMicros", phase.getPriceAmountMicros());
                            price.put("currencyCode", phase.getPriceCurrencyCode());
                            prices.put(price);
                        }
                    }
                }

                JSObject result = new JSObject();
                result.put("prices", prices);
                call.resolve(result);
            });
        }, call);
    }

    private QueryProductDetailsParams.Product subscriptionProduct(String productId) {
        return QueryProductDetailsParams.Product.newBuilder()
            .setProductId(productId)
            .setProductType(BillingClient.ProductType.SUBS)
            .build();
    }

    private JSObject toPurchaseObject(Purchase purchase) {
        JSObject result = new JSObject();
        result.put("purchaseToken", purchase.getPurchaseToken());
        result.put("orderId", purchase.getOrderId());
        result.put("packageName", purchase.getPackageName());
        result.put("purchaseState", purchase.getPurchaseState());
        result.put("isAcknowledged", purchase.isAcknowledged());
        return result;
    }

    private void connectBillingClient(Runnable onConnected, PluginCall call) {
        if (billingClient.isReady()) {
            onConnected.run();
            return;
        }

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    onConnected.run();
                    return;
                }

                rejectWithBillingResult(call, billingResult);
                if (call == pendingPurchaseCall) clearPendingPurchase();
            }

            @Override
            public void onBillingServiceDisconnected() {
                // The next billing request will reconnect.
            }
        });
    }

    private void queryAndLaunchPurchase(
        String productId,
        String basePlanId,
        String oldPurchaseToken,
        String obfuscatedAccountId
    ) {
        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(productId)
            .setProductType(BillingClient.ProductType.SUBS)
            .build();

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(product))
            .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsResult) -> {
            if (pendingPurchaseCall == null) return;

            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                rejectWithBillingResult(pendingPurchaseCall, billingResult);
                clearPendingPurchase();
                return;
            }

            List<ProductDetails> productDetailsList = productDetailsResult.getProductDetailsList();
            if (productDetailsList == null || productDetailsList.isEmpty()) {
                pendingPurchaseCall.reject("Google Play subscription product is not available yet.");
                clearPendingPurchase();
                return;
            }

            ProductDetails productDetails = productDetailsList.get(0);
            String offerToken = findOfferToken(productDetails, basePlanId);
            if (offerToken == null) {
                pendingPurchaseCall.reject("Google Play base plan is not available yet.");
                clearPendingPurchase();
                return;
            }

            BillingFlowParams.ProductDetailsParams productDetailsParams =
                BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(productDetails)
                    .setOfferToken(offerToken)
                    .build();

            BillingFlowParams.Builder flowParamsBuilder = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(productDetailsParams));

            // Lets the server link the purchase to the TailorDeck account from Google's data alone
            // (RTDN), even if the app never gets to verify it.
            if (obfuscatedAccountId != null && !obfuscatedAccountId.trim().isEmpty()) {
                flowParamsBuilder.setObfuscatedAccountId(obfuscatedAccountId);
            }

            // Replace the existing subscription instead of starting a second one that would bill in parallel.
            if (oldPurchaseToken != null && !oldPurchaseToken.trim().isEmpty()) {
                flowParamsBuilder.setSubscriptionUpdateParams(
                    BillingFlowParams.SubscriptionUpdateParams.newBuilder()
                        .setOldPurchaseToken(oldPurchaseToken)
                        .setSubscriptionReplacementMode(
                            BillingFlowParams.SubscriptionUpdateParams.ReplacementMode.WITH_TIME_PRORATION
                        )
                        .build()
                );
            }

            BillingFlowParams flowParams = flowParamsBuilder.build();

            BillingResult launchResult = billingClient.launchBillingFlow(getActivity(), flowParams);
            if (launchResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                rejectWithBillingResult(pendingPurchaseCall, launchResult);
                clearPendingPurchase();
            }
        });
    }

    private String findOfferToken(ProductDetails productDetails, String basePlanId) {
        if (productDetails.getSubscriptionOfferDetails() == null) return null;

        for (ProductDetails.SubscriptionOfferDetails offer : productDetails.getSubscriptionOfferDetails()) {
            if (basePlanId.equals(offer.getBasePlanId())) {
                return offer.getOfferToken();
            }
        }

        return null;
    }

    private boolean isSupportedProduct(String productId) {
        return "tailordeck_starter".equals(productId) || "tailordeck_pro".equals(productId);
    }

    private boolean isSupportedBasePlan(String basePlanId) {
        return "monthly".equals(basePlanId) || "yearly".equals(basePlanId);
    }

    private void rejectWithBillingResult(PluginCall call, BillingResult billingResult) {
        if (call == null) return;
        String message = billingResult.getDebugMessage();
        if (message == null || message.trim().isEmpty()) {
            message = "Google Play Billing request failed.";
        }
        call.reject(message, String.valueOf(billingResult.getResponseCode()));
    }

    private void clearPendingPurchase() {
        pendingPurchaseCall = null;
        pendingProductId = null;
        pendingBasePlanId = null;
    }
}
