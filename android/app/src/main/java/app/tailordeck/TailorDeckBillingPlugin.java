package app.tailordeck;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
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

        connectBillingClient(() -> queryAndLaunchPurchase(productId, basePlanId), call);
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
        JSObject result = new JSObject();
        result.put("status", "purchased");
        result.put("productId", pendingProductId);
        result.put("basePlanId", pendingBasePlanId);
        result.put("purchaseToken", purchase.getPurchaseToken());
        result.put("orderId", purchase.getOrderId());
        result.put("packageName", purchase.getPackageName());
        result.put("purchaseState", purchase.getPurchaseState());
        result.put("isAcknowledged", purchase.isAcknowledged());
        pendingPurchaseCall.resolve(result);
        clearPendingPurchase();
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

    private void queryAndLaunchPurchase(String productId, String basePlanId) {
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

            BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(productDetailsParams))
                .build();

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
