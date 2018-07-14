var LISTRING;
if (typeof LISTRING === "undefined") {
    LISTRING = String.fromCharCode(108, 105, 110, 107, 101, 100, 105, 110)
}
var CG;
if (typeof global !== "undefined" && typeof global.CG !== "undefined") {
    CG = global.CG
}
if (typeof CG === "undefined") {
    CG = {}
}
if (typeof CG.Builder === "undefined") {
    CG.Builder = {
        contact: {},
        contactData: null,
        menuAction: null,
        lookupWindowInfo: {
            windowId: null,
            height: 600,
            width: 600,
            top: null,
            left: null
        },
        csvNext: function(c, b, a) {
            var d = "";
            if (typeof b !== "undefined" && b.length) {
                d = '"' + b.split('"').join('""') + '"'
            }
            if (d.length) {
                a.header.push(c);
                a.row.push(d)
            }
        },
        toCsv: function(a) {
            var c = CG.Builder.flattenContact(a);
            var b = {
                header: [],
                row: []
            };
            Object.keys(c).map(function(d) {
                CG.Builder.csvNext(d, c[d], b)
            });
            return (b.header.join(",") + "\n" + b.row.join(",") + "\n")
        },
        flattenContact: function(l) {
            var b = {};
            var g;
            var o;
            b.name = l.name;
            var j = l.email;
            if (typeof j !== "undefined" && j.length > 0) {
                for (g = 0; g < j.length; g++) {
                    var n = j[g];
                    o = "email" + (g > 0 ? "_" + (g + 1) : "") + "_address";
                    b[o] = n.value;
                    b[o + "_type"] = n.type
                }
            }
            var d = l.phone;
            if (typeof d !== "undefined" && d.length > 0) {
                for (g = 0; g < d.length; g++) {
                    var m = d[g];
                    o = "business_phone";
                    var p = m.type;
                    if (typeof p !== "undefined" && p != null) {
                        if (p == "home") {
                            o = "home_phone"
                        } else {
                            if (p == "mobile") {
                                o = "mobile_phone"
                            } else {
                                if (p == "fax") {
                                    o = "business_fax"
                                }
                            }
                        }
                    }
                    b[o] = m.value
                }
            }
            var c = l.webSite;
            if (typeof c !== "undefined" && c.length > 0) {
                for (g = 0; g < c.length; g++) {
                    var a = c[g];
                    o = "web_site" + (g > 0 ? "_" + (g + 1) : "");
                    b[o] = a
                }
            }
            b[LISTRING + "_url"] = l.liUrl;
            b[LISTRING + "_profile_picture_url"] = l.liProfilePictureUrl;
            b.business_region = l.region;
            b.biography = l.biography;
            var f = l.position;
            if (typeof f !== "undefined" && f.length > 0) {
                for (g = 0; g < f.length; g++) {
                    var h = f[g];
                    o = "position" + (g > 0 ? "_" + (g + 1) : "") + "_title";
                    b[o] = h.title;
                    o = "position" + (g > 0 ? "_" + (g + 1) : "") + "_company";
                    b[o] = h.company;
                    o = "position" + (g > 0 ? "_" + (g + 1) : "") + "_start_month";
                    b[o] = h.start_month;
                    o = "position" + (g > 0 ? "_" + (g + 1) : "") + "_start_year";
                    b[o] = h.start_year;
                    o = "position" + (g > 0 ? "_" + (g + 1) : "") + "_end_month";
                    b[o] = h.end_month;
                    o = "position" + (g > 0 ? "_" + (g + 1) : "") + "_end_year";
                    b[o] = h.end_year
                }
            }
            var k = l.education;
            if (typeof k !== "undefined" && k.length > 0) {
                for (g = 0; g < k.length; g++) {
                    var e = k[g];
                    o = "education" + (g > 0 ? "_" + (g + 1) : "") + "_school";
                    b[o] = e.school;
                    o = "education" + (g > 0 ? "_" + (g + 1) : "") + "_degree";
                    b[o] = e.degree;
                    o = "education" + (g > 0 ? "_" + (g + 1) : "") + "_start_year";
                    b[o] = e.start_year;
                    o = "education" + (g > 0 ? "_" + (g + 1) : "") + "_end_year";
                    b[o] = e.end_year
                }
            }
            return b
        },
        toVCard: function(g) {
            var l = [];
            var d;
            var j;
            l.push("BEGIN:VCARD\nVERSION:3.0");
            l.push("N:;" + g.name + ";;;");
            l.push("FN:" + g.name);
            var f = g.email;
            if (typeof f !== "undefined" && f.length > 0) {
                for (d = 0; d < f.length; d++) {
                    l.push("EMAIL;TYPE=INTERNET:" + f[d])
                }
            }
            var b = g.phone;
            if (typeof b !== "undefined" && b.length > 0) {
                for (d = 0; d < b.length; d++) {
                    var h = b[d];
                    j = "WORK,VOICE";
                    var k = h.type;
                    if (k != null) {
                        if (k == "home") {
                            j = "HOME,VOICE"
                        } else {
                            if (k == "mobile") {
                                j = "CELL"
                            } else {
                                if (k == "fax") {
                                    j = "OTHER"
                                }
                            }
                        }
                    }
                    l.push("TEL;TYPE=" + j + ":" + h.value)
                }
            }
            var a = g.webSite;
            if (typeof a !== "undefined" && a.length > 0) {
                for (d = 0; d < a.length; d++) {
                    l.push("URL:" + a[d])
                }
            }
            if (g.liUrl.length) {
                l.push("URL:" + g.liUrl)
            }
            if (g.liProfilePictureUrl.length) {
                l.push("PHOTO;JPEG:" + g.liProfilePictureUrl)
            }
            var c = g.position;
            if (typeof c !== "undefined" && c.length > 0) {
                var e = c[0];
                if (e.company.length) {
                    l.push("ORG:" + e.company)
                }
                if (e.title.length) {
                    l.push("TITLE:" + e.title)
                }
            }
            l.push("END:VCARD\n");
            return l.join("\n")
        },
        postTab: function(d) {
            var c = CG.Builder.contact;
            var f = CG.Builder.toCsv(c);
            var b = c.sourceHTML;
            var e = c.logData;
            var a = !!CG.Options.items.destinationWebsiteTabActive;
            chrome.tabs.create({
                url: chrome.runtime.getURL("post.html"),
                active: a
            }, function(h) {
                var g = function(j, i) {
                    if (j === h.id && i.status === "complete") {
                        chrome.tabs.onUpdated.removeListener(g);
                        chrome.tabs.sendMessage(j, {
                            command: "post",
                            url: d,
                            data: f,
                            sourceHTML: b,
                            logData: e
                        })
                    }
                };
                chrome.tabs.onUpdated.addListener(g);
                chrome.tabs.sendMessage(h.id, {
                    command: "post",
                    url: d,
                    data: f,
                    sourceHTML: b,
                    logData: e
                })
            });
            CG.Options.load(function() {
                if (CG.Options.trace == "log") {
                    CG.Options.clearTrace()
                }
            })
        },
        downloadFile: function(e, b, d) {
            if (e.indexOf("%NAME%") >= 0 && typeof b.name !== "undefined" && b.name.length) {
                e = e.replace(/%NAME%/g, b.name).replace(/\s/g, "")
            }
            var g = document.createElement("a");
            g.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(d));
            g.setAttribute("download", e);
            g.click();
            var a = b.sourceHTML;
            if (typeof a !== "undefined" && a.length) {
                var f = document.createElement("a");
                f.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(a));
                f.setAttribute("download", e + ".html");
                f.click()
            }
            var h = b.logData;
            if (typeof h !== "undefined" && h.length) {
                var c = document.createElement("a");
                c.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(h));
                c.setAttribute("download", e + ".log");
                c.click()
            }
        },
        lookupContact: function(a, c) {
            var b = CG.Builder.getLookupUrl(a, c);
            if (CG.Builder.lookupWindowInfo.windowId === null) {
                chrome.windows.getCurrent(function(d) {
                    CG.Builder.lookupWindowInfo.top = d.top + 100;
                    CG.Builder.lookupWindowInfo.left = d.left + (d.width - CG.Builder.lookupWindowInfo.width - 10);
                    CG.Builder.createLookupWindow(b)
                })
            } else {
                chrome.windows.get(CG.Builder.lookupWindowInfo.windowId, function(d) {
                    if (!chrome.runtime.lastError && typeof d !== "undefined") {
                        CG.Builder.lookupWindowInfo.top = d.top;
                        CG.Builder.lookupWindowInfo.left = d.left;
                        CG.Builder.lookupWindowInfo.width = d.width;
                        CG.Builder.lookupWindowInfo.height = d.height
                    }
                    chrome.windows.remove(CG.Builder.lookupWindowInfo.windowId, function() {
                        var e = chrome.runtime.lastError;
                        CG.Builder.createLookupWindow(b)
                    })
                })
            }
        },
        createLookupWindow: function(a) {
            var b = CG.Builder.lookupWindowInfo;
            chrome.windows.getCurrent(function(c) {
                chrome.windows.create({
                    url: a,
                    type: "panel",
                    width: b.width,
                    height: b.height,
                    top: b.top,
                    left: b.left,
                    focused: false
                }, function(d) {
                    CG.Builder.lookupWindowInfo.windowId = d.id
                })
            })
        },
        getLookupUrl: function(a, h) {
            var b = h;
            var f = CG.Builder.flattenContact(a);
            var e = h.match(/%[A-Z_]+?%/g);
            for (var c = 0; e !== null && c < e.length; c++) {
                var g = e[c].replace(/%/g, "").toLowerCase();
                var d = f[g];
                if (g.match(/name|email|phone|url/) === null) {
                    d = "_$UnsupportedField$!_"
                } else {
                    if (typeof d === "undefined" || d === null) {
                        d = "_$ValueNotFound$!_"
                    }
                }
                b = b.replace(e[c], d)
            }
            return b
        },
        buildFromContactData: function() {
            var d = CG.Builder.menuAction;
            CG.Builder.menuAction = null;
            if (d == null) {
                d = CG.Options.items.destinationType
            }
            if (d == "download_csv") {
                var f = CG.Builder.contact;
                var b = CG.Builder.toCsv(f);
                var e = CG.Options.items.destinationCSVFile;
                CG.Builder.downloadFile(e, f, b)
            } else {
                if (d == "download_vcard") {
                    var i = CG.Builder.contact;
                    var j = CG.Builder.toVCard(i);
                    var k = CG.Options.items.destinationVCardFile;
                    CG.Builder.downloadFile(k, i, j)
                } else {
                    if (d !== null && d.indexOf("lookup") === 0) {
                        var h = null;
                        if (d != null && d.indexOf("lookupurl_") == 0) {
                            var c = parseInt(d.split("_")[1]);
                            h = CG.Options.urlByIndex(c, "lookup")
                        }
                        if (h == null) {
                            h = CG.Options.items.lookupUrl
                        }
                        CG.Builder.lookupContact(CG.Builder.contact, h)
                    } else {
                        var a = null;
                        if (d != null && d.indexOf("url_") == 0) {
                            var g = parseInt(d.split("_")[1]);
                            a = CG.Options.urlByIndex(g, "destination")
                        }
                        if (a == null) {
                            a = CG.Options.items.destinationUrl
                        }
                        CG.Builder.postTab(a)
                    }
                }
            }
        },
        build: function(a) {
            CG.Builder.contact = a;
            CG.Options.load(CG.Builder.buildFromContactData)
        },
        contextMenuAction: function(b, a) {
            CG.Builder.menuAction = b.menuItemId;
            CG.Builder.invoke(a)
        },
        generateContextMenus: function() {
            chrome.contextMenus.create({
                title: "Download to CSV",
                id: "download_csv",
                contexts: ["page"],
                onclick: CG.Builder.contextMenuAction
            });
            chrome.contextMenus.create({
                title: "Download to vCard",
                id: "download_vcard",
                contexts: ["page"],
                onclick: CG.Builder.contextMenuAction
            });
            var a = CG.Options.urlLabels("destination");
            if (a.length) {
                var c = chrome.contextMenus.create({
                    title: "Upload to website",
                    id: "website",
                    contexts: ["page"]
                });
                for (var b = 0; b < a.length; b++) {
                    chrome.contextMenus.create({
                        parentId: c,
                        id: "url_" + b,
                        title: a[b],
                        contexts: ["page"],
                        onclick: CG.Builder.contextMenuAction
                    })
                }
            }
            a = CG.Options.urlLabels("lookup");
            if (a.length) {
                c = chrome.contextMenus.create({
                    title: "Lookup from website",
                    id: "lookup_contact",
                    contexts: ["page"]
                });
                for (b = 0; b < a.length; b++) {
                    chrome.contextMenus.create({
                        parentId: c,
                        id: "lookupurl_" + b,
                        title: a[b],
                        contexts: ["page"],
                        onclick: CG.Builder.contextMenuAction
                    })
                }
            }
        },
        invoke: function(a) {
            chrome.tabs.executeScript(a.id, {
                file: "jquery.min.js"
            }, function() {
                chrome.tabs.executeScript(a.id, {
                    file: "options.js"
                }, function() {
                    chrome.tabs.executeScript(a.id, {
                        file: "grabber.js"
                    })
                })
            })
        },
        lookup: function(a) {
            CG.Builder.menuAction = "lookup_contact";
            CG.Builder.invoke(a)
        }
    }
}
chrome.runtime.onMessage.addListener(function(c, b, a) {
    if (c.command == "buildContact") {
        if (typeof c.result !== "undefined" && c.result != null) {
            CG.Builder.build(c.result)
        }
    } else {
        if (c.command == "updatedOptions") {
            chrome.contextMenus.removeAll();
            CG.Options.load(CG.Builder.generateContextMenus)
        }
    }
});
chrome.browserAction.onClicked.addListener(function(a) {
    CG.Builder.invoke(a)
});
chrome.commands.onCommand.addListener(function(a) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(c) {
        var b = c[0];
        if (a === "extract-contact") {
            CG.Builder.invoke(b)
        } else {
            if (a === "lookup-contact") {
                CG.Builder.lookup(b)
            }
        }
    })
});
CG.Options.load(CG.Builder.generateContextMenus);