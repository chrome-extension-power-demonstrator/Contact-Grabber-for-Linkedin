var CG;
if (typeof global !== "undefined" && typeof global.CG !== "undefined") {
    CG = global.CG
}
if (typeof CG === "undefined") {
    CG = {}
}
if (typeof CG.Post === "undefined") {
    CG.Post = {
        postForm: function(f) {
            var e = document.createElement("form");
            e.setAttribute("method", "post");
            e.setAttribute("action", f.url);
            var d = document.createElement("input");
            d.setAttribute("type", "hidden");
            d.setAttribute("name", "data");
            d.setAttribute("value", f.data);
            e.appendChild(d);
            if (typeof f.logData !== "undefined" && f.logData.length) {
                var c = document.createElement("input");
                c.setAttribute("type", "hidden");
                c.setAttribute("name", "logData");
                c.setAttribute("value", f.logData);
                e.appendChild(c)
            }
            if (typeof f.sourceHTML !== "undefined" && f.sourceHTML.length) {
                var b = document.createElement("input");
                b.setAttribute("type", "hidden");
                b.setAttribute("name", "sourceHTML");
                b.setAttribute("value", f.sourceHTML);
                e.appendChild(b)
            }
            var a = document.createElement("input");
            a.setAttribute("type", "hidden");
            a.setAttribute("name", "scrappysoft_cg_version");
            a.setAttribute("value", chrome.runtime.getManifest()["version"]);
            e.appendChild(a);
            document.body.appendChild(e);
            e.submit()
        },
        listenForPostRequest: function(a) {
            if (a.command === "post") {
                chrome.runtime.onMessage.removeListener(CG.Post.listenForPostRequest);
                CG.Post.postForm(a)
            }
        }
    }
}
chrome.runtime.onMessage.addListener(CG.Post.listenForPostRequest);