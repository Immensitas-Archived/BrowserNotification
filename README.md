![Vizury Logo](https://github.com/vizury/BrowserNotificationKit/blob/master/VizuryLogo.png)
## Summary
 This is BrowserNotification SDK integration guide.

## <a id="integration-steps"></a>Integration Steps

1) Go through the integration document(Vizury_Engage_Browser-Notifications_Tech-Integration.docx) which describes all aspects of integration.

2) From your account manager get the values for the macros :

    a) vizuryServiceWorker.js
           var advid = 'VIZVRMXYZ'; // Replace this macro with relevant Advertiser ID.
           var target = "XXXX.vizury.com"; // Replace this with relevant domain.

    b) manifest.json
           {
                 "name":"XXXXX",
                 "gcm_sender_id": "XXXXXXX"
           }

    c) From the integration document get the following place holder from account manager.
           //Replace “VIZVRMXYZ” with the one which we will be sharing with you
           viz.src = ("https:" == document.location.protocol ? "https://cdn6.vizury.com" : "http://cdn6.vizury.com ") + "/analyze/pixel.php?account_id=VIZVRMXYZ";

    d) Get the customjs link as given in the tech integration doc.
	   <script src="<filename as provided by Account Manager>" >
          </script>

3) Change the vizuryServiceWorker.js and manifest.json file with the actual macros values and put them in the root directory of your domain. 

