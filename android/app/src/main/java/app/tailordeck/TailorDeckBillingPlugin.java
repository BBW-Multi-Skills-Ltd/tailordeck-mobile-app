package app.tailordeck;

import com.android.billingclient.api.BillingClient;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TailorDeckBilling")
public class TailorDeckBillingPlugin extends Plugin {
    @PluginMethod
    public void getBillingStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", true);
        result.put("responseOkCode", BillingClient.BillingResponseCode.OK);
        call.resolve(result);
    }
}
