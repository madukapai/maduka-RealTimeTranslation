function onDeviceReady() {
    window.plugins.screensize.get(successCallback, onFail);
}

function successCallback(result) {
    document.getElementById("divBody").style.width = window.screen.width + "px"; 
    document.getElementById("divBody").style.height = window.screen.height + "px";
    funMicrophoneAuthorize();
}

function funMicrophoneAuthorize() {
    var permissions = cordova.plugins.permissions;
    permissions.checkPermission(permissions.RECORD_AUDIO, function (status) {
        if (!status.hasPermission) {
            permissions.requestPermission(permissions.RECORD_AUDIO, funConfirmMicrophoneAuthorize, onFail);
        }
    });
}

function funConfirmMicrophoneAuthorize() {
    var permissions = cordova.plugins.permissions;
    permissions.checkPermission(permissions.RECORD_AUDIO, function (status) {
        if (!status.hasPermission) navigator.app.exitApp();
    });
}


function funOpenVoice() {
    funMicrophoneAuthorize();
    var itemSource = document.getElementById("ddlSource");
    var source = itemSource.options[itemSource.selectedIndex].value;

    var itemDesc = document.getElementById("ddlDesc");
    var desc = itemDesc.options[itemDesc.selectedIndex].value;

    let options = {
        language: source,
        matches: 1,
        prompt: "",      // Android only
        showPopup: true,  // Android only
        showPartial: false
    };

    window.plugins.speechRecognition.startListening(
        function (x) { funGetVoiceResult(x, desc); },
        onFail,
        options);
}

function funGetVoiceResult(x, desc) {
    document.getElementById("txtSource").value = x;

    // 轉換成微軟語系的文字
    var langArr = {
        "cmn-Hans-CN": "zh-Hans",
        "cmn-Hant-TW": "zh-Hant"
    }

    var lang = desc.substring(0, 2);
    if (desc == "cmn-Hans-CN") { lang = "zh-Hans" }
    if (desc == "cmn-Hant-TW") { lang = "zh-Hant" }

    // 繼續進行翻譯的動作
    GetTranslater(x[0], lang);
}

function GetTranslater(source, target) {
    var TranslaterUrl = "https://api.microsofttranslator.com/V2/Http.svc/Translate";
    var TranslaterApiKey = "abeb23ed7fea4840a257de1076970a77";

    var params = {
        // Request parameters
        "to": target,
        "text": source
    };

    var strUrl = TranslaterUrl + "?" + $.param(params);
    $.ajax({
        url: strUrl,
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", TranslaterApiKey);
        },
        type: "GET",
        success: onTranslaterDone,
        error: onFail
    })
}

function onTranslaterDone(caption) {
    var str = caption.getElementsByTagName("string")[0].textContent;
    document.getElementById("txtDesc").value = str;

    var itemDesc = document.getElementById("ddlDesc");
    var desc = itemDesc.options[itemDesc.selectedIndex].value;

    // 轉換語系的文字
    var langArr = {
        "cmn-Hans-CN": "zh-CN",
        "cmn-Hant-TW": "zh-TW"
    }

    var langDesc = langArr[desc];
    if (langDesc == undefined)
        langDesc = desc;

    TTS.speak({
        text: str,
        locale: langDesc,
        rate: 0.75
    }).then(null, onFail);
}

function onFail(x) {
    document.getElementById("txtDesc").value = x;
}

function funChangeLanguage(x) {
    if (x == "source") {
        var itemDesc = document.getElementById("ddlSource");
        var desc = itemDesc.options[itemDesc.selectedIndex].text;
        document.getElementById("lblSource").innerHTML = desc;
   }
    else {
        var itemDesc = document.getElementById("ddlDesc");
        var desc = itemDesc.options[itemDesc.selectedIndex].text;
        document.getElementById("lblDesc").innerHTML = desc;
    }
}