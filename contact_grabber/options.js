var CG;
if (typeof global !== "undefined" && typeof global.CG !== "undefined") {
    CG = global.CG
}
if (typeof CG === "undefined") {
    CG = {}
}
if (typeof CG.Options === "undefined") {
    CG.Options = {
        items: {},
        trace: null,
        save: function() {
            if ($("#destination_type_download_csv").is(":checked")) {
                CG.Options.items.destinationType = "download_csv";
                CG.Options.items.destinationCSVFile = $("#destination_csv_file").prop("value")
            } else {
                if ($("#destination_type_download_vcard").is(":checked")) {
                    CG.Options.items.destinationType = "download_vcard";
                    CG.Options.items.destinationVCardFile = $("#destination_vcard_file").prop("value")
                } else {
                    CG.Options.items.destinationType = "website";
                    var e = $("#destination_url_set").prop("value");
                    CG.Options.items.destinationUrlSet = e;
                    if (e.length) {
                        var c = e.split("\n");
                        CG.Options.items.destinationUrl = c[0]
                    }
                    var b = $("#destination_website_tab_active").prop("checked");
                    CG.Options.items.destinationWebsiteTabActive = b
                }
            }
            var a = $("#lookup_url_set").prop("value");
            CG.Options.items.lookupUrlSet = a;
            if (a.length) {
                var d = a.split("\n");
                CG.Options.items.lookupUrl = d[0]
            }
            chrome.storage.sync.set({
                cgDestinationType: CG.Options.items.destinationType,
                cgDestinationCSVFile: CG.Options.items.destinationCSVFile,
                cgDestinationVCardFile: CG.Options.items.destinationVCardFile,
                cgDestinationUrlSet: CG.Options.items.destinationUrlSet,
                cgDestinationUrl: CG.Options.items.destinationUrl,
                cgDestinationWebsiteTabActive: CG.Options.items.destinationWebsiteTabActive,
                cgLookupUrlSet: CG.Options.items.lookupUrlSet,
                cgLookupUrl: CG.Options.items.lookupUrl,
                cgTrace: CG.Options.trace
            }, function() {
                chrome.runtime.sendMessage({
                    command: "updatedOptions"
                });
                var f = $("#status");
                f.text("Options saved.");
                f.show();
                setTimeout(function() {
                    f.fadeOut(1000, "swing", function() {
                        f.text("")
                    })
                }, 1000)
            })
        },
        load: function(a) {
            chrome.storage.sync.get({
                cgDestinationType: "download_csv",
                cgDestinationCSVFile: "%NAME%.csv",
                cgDestinationVCardFile: "%NAME%.vcf",
                cgDestinationUrlSet: null,
                cgDestinationUrl: null,
                cgDestinationWebsiteTabActive: true,
                cgLookupUrlSet: null,
                cgLookupUrl: null,
                cgTrace: null
            }, function(b) {
                CG.Options.items.destinationType = b.cgDestinationType;
                CG.Options.items.destinationCSVFile = b.cgDestinationCSVFile;
                CG.Options.items.destinationVCardFile = b.cgDestinationVCardFile;
                CG.Options.items.destinationUrlSet = b.cgDestinationUrlSet;
                CG.Options.items.destinationUrl = b.cgDestinationUrl;
                CG.Options.items.destinationWebsiteTabActive = b.cgDestinationWebsiteTabActive;
                CG.Options.items.lookupUrlSet = b.cgLookupUrlSet;
                CG.Options.items.lookupUrl = b.cgLookupUrl;
                CG.Options.trace = b.cgTrace;
                if (typeof a !== "undefined") {
                    a()
                }
            })
        },
        restore: function() {
            $("#destination_csv_file").prop("value", CG.Options.items.destinationCSVFile);
            $("#destination_vcard_file").prop("value", CG.Options.items.destinationVCardFile);
            $("#destination_url_set").prop("value", CG.Options.items.destinationUrlSet);
            $("#destination_website_tab_active").prop("checked", CG.Options.items.destinationWebsiteTabActive);
            CG.Options.populateUrlSelector("destination");
            if (CG.Options.items.destinationType == "download_csv") {
                $("#destination_type_download_csv").prop("checked", true)
            } else {
                if (CG.Options.items.destinationType == "download_vcard") {
                    $("#destination_type_download_vcard").prop("checked", true)
                } else {
                    $("#destination_type_website").prop("checked", true)
                }
            }
            CG.Options.setDestinationType();
            CG.Options.setDestLabel();
            $("#lookup_url_set").prop("value", CG.Options.items.lookupUrlSet);
            CG.Options.populateUrlSelector("lookup")
        },
        setDestinationType: function() {
            if ($("#destination_type_download_csv").is(":checked")) {
                $("#destination_select_website").hide();
                $("#destination_select_download_vcard").hide();
                $("#destination_select_download_csv").show()
            } else {
                if ($("#destination_type_download_vcard").is(":checked")) {
                    $("#destination_select_website").hide();
                    $("#destination_select_download_csv").hide();
                    $("#destination_select_download_vcard").show()
                } else {
                    $("#destination_select_download_vcard").hide();
                    $("#destination_select_download_csv").hide();
                    $("#destination_select_website").show()
                }
            }
        },
        populateUrlSelector: function(d) {
            var g = $("#" + d + "_url_set").prop("value");
            var b = "";
            if (g.length) {
                var a = g.split("\n");
                for (var c = 0; c < a.length; c++) {
                    var f = a[c].trim();
                    if (f.length) {
                        b += "<option value='" + c + "'" + (c == 0 ? " selected" : "") + ">" + CG.Options.urlLabel(f) + "</option>"
                    }
                }
            } else {
                b = "<option disabled>No Available URLs</option>"
            }
            var e = $("#" + d + "_url_selector");
            e.html("");
            e.append(b)
        },
        prioritizeUrl: function(b, e) {
            var f = $("#" + e + "_url_set").prop("value");
            if (f.length) {
                var a = f.split("\n");
                var d = a[b];
                a.splice(b, 1);
                a.splice(0, 0, d)
            }
            for (var c = 0; c < a.length; c++) {
                a[c] = a[c].trim().replace(/\s*##\s*/, "##")
            }
            $("#" + e + "_url_set").prop("value", a.join("\n").replace(/\n\n+/, "\n").trim())
        },
        urlLabel: function(a) {
            var b = a.split("##");
            if (b.length > 1) {
                return b[b.length - 1]
            } else {
                return b[0]
            }
        },
        urlLabels: function(d) {
            var b = [];
            var f = CG.Options.items[d + "UrlSet"];
            if (typeof f !== "undefined" && f !== null && f.length) {
                var a = f.split("\n");
                for (var c = 0; c < a.length; c++) {
                    var e = a[c].trim();
                    b.push(CG.Options.urlLabel(e))
                }
            }
            return b
        },
        urlByIndex: function(b, c) {
            var d = CG.Options.items[c + "UrlSet"];
            if (d.length && b < d.length) {
                var a = d.split("\n");
                return a[b]
            }
            return null
        },
        toggleTrace: function() {
            if (CG.Options.trace == null) {
                CG.Options.trace = "console"
            } else {
                if (CG.Options.trace == "console") {
                    CG.Options.trace = "log"
                } else {
                    if (CG.Options.trace == "log") {
                        CG.Options.trace = null
                    }
                }
            }
            CG.Options.setDestLabel()
        },
        clearTrace: function() {
            CG.Options.trace = null;
            setTimeout(function() {
                chrome.storage.sync.set({
                    cgTrace: null
                });
                alert("NOTE: Disabled log tracing")
            }, 6000)
        },
        setDestLabel: function() {
            if (CG.Options.trace != null) {
                $("#destLabel")[0].innerHTML = "Destination: (" + CG.Options.trace + " trace enabled)"
            } else {
                $("#destLabel")[0].innerHTML = "Destination:"
            }
        }
    }
}
if (document.location.href.indexOf("/options.html") > 0) {
    $(document).on("DOMContentLoaded", CG.Options.load(CG.Options.restore));
    $("#save").on("click", CG.Options.save);
    $("#destLabel").on("dblclick", CG.Options.toggleTrace);
    $("#destination_type_download_csv").on("click", CG.Options.setDestinationType);
    $("#destination_type_download_vcard").on("click", CG.Options.setDestinationType);
    $("#destination_type_website").on("click", CG.Options.setDestinationType);
    $("#destination_url_selector").on({
        focus: function() {
            CG.Options.populateUrlSelector("destination")
        },
        change: function() {
            choice = $(this).val();
            CG.Options.prioritizeUrl(choice, "destination")
        }
    });
    $("#destination_url_set").on({
        change: function() {
            CG.Options.prioritizeUrl(0, "destination")
        }
    });
    $("#lookup_url_selector").on({
        focus: function() {
            CG.Options.populateUrlSelector("lookup")
        },
        change: function() {
            choice = $(this).val();
            CG.Options.prioritizeUrl(choice, "lookup")
        }
    });
    $("#lookup_url_set").on({
        change: function() {
            CG.Options.prioritizeUrl(0, "lookup")
        }
    })
}
if (typeof module !== "undefined") {
    module.exports = CG
};