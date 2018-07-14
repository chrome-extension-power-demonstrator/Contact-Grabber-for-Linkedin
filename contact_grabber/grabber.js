var LISTRING;
if (typeof LISTRING === "undefined") {
    LISTRING = String.fromCharCode(108, 105, 110, 107, 101, 100, 105, 110)
}
if (typeof LIRSTRING === "undefined") {
    LIRSTRING = String.fromCharCode(47, 114, 101, 99, 114, 117, 105, 116, 101, 114, 47)
}
var CG;
if (typeof global !== "undefined" && typeof global.CG !== "undefined") {
    CG = global.CG
}
if (typeof CG === "undefined") {
    CG = {}
}
if (typeof CG.Grabber === "undefined") {
    CG.Grabber = {
        result: undefined,
        logData: "",
        trace: function(a) {
            if (typeof CG.Options.trace === "undefined" || CG.Options.trace == null) {
                return
            }
            if (CG.Options.trace == "console") {
                console.log(a)
            }
            if (CG.Options.trace == "log") {
                CG.Grabber.logData += a + "\n"
            }
        },
        complete: function() {
            if (typeof CG.Grabber.result !== "undefined" && Object.keys(CG.Grabber.result).length > 0) {
                CG.Grabber.status("Contact grabbed", 3000);
                chrome.runtime.sendMessage({
                    command: "buildContact",
                    result: CG.Grabber.result
                });
                setTimeout(function() {
                    CG.Grabber.result = undefined
                }, 500)
            } else {
                CG.Grabber.status("No contact information found", 3000)
            }
        },
        status: function(b, c) {
            if (CG.Grabber.clearStatusTimeout != null) {
                clearTimeout(CG.Grabber.clearStatusTimeout);
                CG.Grabber.clearStatusTimeout = null
            }
            var a = $("#cg-status-area");
            if (typeof a === "undefined" || a == null || a.length == 0) {
                $("body").prepend('<div id="cg-status-area"/>');
                a = $("#cg-status-area");
                a.css({
                    position: "fixed",
                    top: "5px",
                    right: "5px",
                    "text-align": "center",
                    "z-index": "99999999",
                    border: "solid 1pt #0000CC",
                    padding: "8px",
                    "background-color": "#CCFFFF",
                    color: "#000066",
                    "font-style": "italic",
                    "font-size": "10pt"
                })
            }
            a.text(b);
            a.show();
            CG.Grabber.clearStatusTimeout = setTimeout(CG.Grabber.clearStatus, c)
        },
        clearStatusTimeout: null,
        clearStatus: function() {
            var a = $("#cg-status-area");
            if (typeof a !== "undefined" && a.length) {
                a.fadeOut(500)
            }
        },
        sanitizeText: function(a) {
            if (typeof a === "undefined" || a == null || a.length == 0) {
                return a
            }
            return a.replace(/\u2019/g, "'").replace(/\u2011|\u2013|\u2014|\ufe58|\u2e3a|\u2e3b/g, "-").trim()
        },
        parseItems: function(b, e, a, d) {
            if (typeof d === "undefined") {
                d = {}
            }
            CG.Grabber.trace("\n(parseItems): field=" + e + ", selector=$('" + a + "'), opts=" + JSON.stringify(d));
            var c = [];
            $(a).each(function(f) {
                CG.Grabber.trace("(parseItems): processing index " + f);
                if (d.href === true) {
                    c[f] = this.href || this[0].href;
                    CG.Grabber.trace("(parseItems)[href]: " + c[f])
                } else {
                    if (d.src === true) {
                        c[f] = this.src;
                        CG.Grabber.trace("(parseItems)[src]: " + c[f])
                    } else {
                        if (d.typedValue === true) {
                            var h = CG.Grabber.sanitizeText($(this).find(".type").text());
                            var g = CG.Grabber.sanitizeText($(this).find(".value").text());
                            if (h.length == 0) {
                                h = "work"
                            } else {
                                if (g.length == 0) {
                                    g = this.textContent;
                                    if (typeof g !== "undefined") {
                                        g = CG.Grabber.sanitizeText(g.replace(h, "").trim())
                                    } else {
                                        g = ""
                                    }
                                }
                            }
                            if (g.length == 0) {
                                g = CG.Grabber.sanitizeText($(this).text())
                            }
                            c[f] = {
                                value: g,
                                type: h.toLowerCase()
                            };
                            CG.Grabber.trace("(parseItems)[typedValue]: " + JSON.stringify(c[f]))
                        } else {
                            if (d.textContent === true) {
                                c[f] = CG.Grabber.sanitizeText(this.textContent);
                                CG.Grabber.trace("(parseItems)[textContent]: " + c[f])
                            } else {
                                if (typeof d.processElement !== "undefined") {
                                    c[f] = CG.Grabber.sanitizeText(d.processElement(this));
                                    CG.Grabber.trace("(parseItems)[processElement]: " + c[f])
                                } else {
                                    c[f] = CG.Grabber.sanitizeText($(this).text());
                                    CG.Grabber.trace("(parseItems)[default]: " + c[f])
                                }
                            }
                        }
                    }
                }
            });
            if (c.length) {
                if (d.single === true) {
                    b[e] = c[0]
                } else {
                    b[e] = c
                }
            }
            CG.Grabber.trace("(parseItems): contact[" + e + "]=" + b[e])
        },
        parseMonthYearDate: function(f, d, e) {
            if (!d.length) {
                return
            }
            var c = e + "_month";
            var b = e + "_year";
            d = d.replace(/^.*?[–-]\s*/, "").replace(/Present/, "").trim();
            f[b] = d;
            f[c] = "";
            var a = d.split(" ");
            if (a.length > 1) {
                f[c] = a[0];
                f[b] = a[1]
            }
        },
        parseSkypeC2CPhone: function(a) {
            if ($(".skype_c2c_container".length)) {
                return $(a).clone().find(".skype_c2c_container").remove().end().text().trim().replace(/\s+/, " ")
            } else {
                return $(a).text()
            }
        },
        grab: function() {
            CG.Options.load(function() {
                for (var a in CG.Grabber.parsers) {
                    if (CG.Grabber.parsers.hasOwnProperty(a)) {
                        console.log("parser", a);
                        CG.Grabber.parsers[a].grab(CG.Grabber)
                    }
                    if (typeof CG.Grabber.result !== "undefined") {
                        break
                    }
                }
                if (typeof CG.Grabber.result === "undefined") {
                    CG.Grabber.trace("(grab): unable to parse");
                    CG.Grabber.status("No parseable contact information found", 3000)
                }
            })
        },
        parsers: {
            gmail: {
                grab: function(d) {
                    d.trace("(grab): try grabGmail");
                    if (document.location.origin.indexOf("mail.google.com") < 0) {
                        return
                    }
                    d.result = null;
                    var b = $(".h7:first");
                    if (b.length == 0) {
                        return
                    }
                    var c = b.find("h3.iw span.gD");
                    var a = {};
                    a.name = c.attr("name");
                    a.email = [{
                        value: c.attr("email"),
                        type: "other"
                    }];
                    if (typeof a.name !== "undefined" && a.name.length && a.email.length) {
                        d.result = a;
                        d.complete()
                    }
                }
            },
            hCard: {
                grab: function(f) {
                    if (document.location.origin.indexOf(LISTRING + ".com") >= 0 || $(".vcard").length == 0) {
                        return
                    }
                    f.result = null;
                    var a = {};
                    f.parseItems(a, "name", ".vcard:first .fn", {
                        single: true
                    });
                    f.parseItems(a, "email", ".vcard:first .email", {
                        typedValue: true
                    });
                    f.parseItems(a, "phone", ".vcard:first .tel", {
                        typedValue: true
                    });
                    f.parseItems(a, "address", ".vcard:first .adr");
                    var c = f.sanitizeText($(".vcard:first .org").text());
                    var e = f.sanitizeText($(".vcard:first .title").text());
                    if (c.length || e.length) {
                        a.position = [{
                            company: c,
                            title: e
                        }]
                    }
                    if (typeof a.email !== "undefined") {
                        for (i = 0; i < a.email.length; i++) {
                            var d = a.email[i];
                            d.type = "other";
                            a.email[i] = d
                        }
                    }
                    if (typeof a.phone !== "undefined") {
                        for (i = 0; i < a.phone.length; i++) {
                            var b = a.phone[i];
                            if (b.type == "cell") {
                                b.type = "mobile"
                            } else {
                                if (b.type == "home") {
                                    b.type = "home"
                                } else {
                                    if (b.type == "work") {
                                        b.type = "work"
                                    } else {
                                        if (b.type == "fax") {
                                            b.type = "fax"
                                        } else {
                                            b.type = "other"
                                        }
                                    }
                                }
                            }
                            a.phone[i] = b
                        }
                    }
                    f.result = a;
                    f.complete()
                }
            },
            lir: {
                grab: function(b) {
                    if (document.location.origin.indexOf(LISTRING + ".com") < 0 || document.location.pathname.indexOf(LIRSTRING) < 0) {
                        return
                    }
                    var a = {};
                    a.pageType = "lir";
                    a.contactInfoSelector = ".contact-info button";
                    a.contactInfoLoadingElem = ".contact-info-modal-shim";
                    b.parsers.li.commonGrab(b, b.parsers.lir, a)
                },
                setProfilePageSelectors: function(b, c, a) {
                    a.selectors = {
                        name: {
                            selector: ".profile-info h1.searchable",
                            opts: {
                                single: true
                            }
                        },
                        email: {
                            selector: "#email-list .type-text"
                        },
                        phone: {
                            selector: "#phone-list .type-text",
                            opts: {
                                processElement: b.parseSkypeC2CPhone
                            }
                        },
                        phoneType: {
                            selector: "#phone-list .type-label"
                        },
                        address: {
                            selector: "#address-list .type-text"
                        },
                        webSite: {
                            selector: "li.website a",
                            opts: {
                                href: true
                            }
                        },
                        liUrl: {
                            selector: "#topcard li.public-profile a",
                            opts: {
                                href: true,
                                single: true
                            }
                        },
                        region: {
                            selector: ".location a",
                            opts: {
                                single: true
                            }
                        },
                        liProfilePictureUrl: {
                            selector: '#topcard img[alt="Profile photo"]',
                            opts: {
                                src: true,
                                single: true
                            }
                        },
                        biography: [{
                            selector: "#profile-summary .module-body",
                            opts: {
                                single: true
                            }
                        }, {
                            selector: ".profile-info li.title",
                            opts: {
                                single: true
                            }
                        }],
                        position: {
                            container: {
                                selector: "#profile-experience"
                            },
                            item: {
                                selector: "li.position"
                            },
                            title: {
                                selector: ".position-header h4"
                            },
                            company: {
                                selector: "h4 + h5 a"
                            },
                            startDate: {
                                selector: ".position-header .date-range"
                            }
                        },
                        education: {
                            container: {
                                selector: "#profile-education"
                            },
                            item: {
                                selector: "li.position"
                            },
                            school: {
                                selector: "h4 a"
                            },
                            degree: {
                                selector: "h5"
                            },
                            startDate: {
                                selector: ".position-header .date-range"
                            }
                        }
                    }
                }
            },
            liLegacy: {
                grab: function(b) {
                    if (document.location.origin.indexOf(LISTRING + ".com") < 0 || document.location.pathname.indexOf(LIRSTRING) >= 0 || $(".pv-top-card-section__name").length) {
                        return
                    }
                    var a = {};
                    a.pageType = "liLegacy";
                    if ($("#name.editable-item button.edit-field-button").length) {
                        a.pageType = "selfLegacy"
                    }
                    a.contactInfoSelector = ".show-more-info";
                    a.contactInfoLoadingElem = ".www-presence";
                    b.parsers.li.commonGrab(b, b.parsers.liLegacy, a)
                },
                setInitialSelectors: function(b, c, a) {
                    if ($(".fp-degree-icon abbr").text() == "1st") {
                        a.pageType = "connection"
                    } else {
                        if ($(".show-more-info.relationship-contact").length) {
                            a.contactInfoLoadingElem = "#relationship-contact-info-section";
                            a.pageType = "old_connection"
                        }
                    }
                },
                setProfilePageSelectors: function(d, g, b) {
                    var f = {
                        name: {
                            selector: ".fn .full-name",
                            opts: {
                                single: true
                            }
                        },
                        region: [{
                            selector: "#location .locality a",
                            opts: {
                                single: true
                            }
                        }, {
                            selector: "#location .locality",
                            opts: {
                                single: true
                            }
                        }],
                        liProfilePictureUrl: {
                            selector: "#top-card .profile-picture img",
                            opts: {
                                src: true,
                                single: true
                            }
                        },
                        biography: [{
                            selector: "#summary-item-view .summary p.description .field-text",
                            opts: {
                                single: true
                            }
                        }, {
                            selector: "#summary-item-view .summary p.description",
                            opts: {
                                single: true
                            }
                        }]
                    };
                    var e = {};
                    if (b.pageType === "connection") {
                        e = {
                            email: {
                                selector: ".profile-card-extras #email-view li a"
                            },
                            phone: {
                                selector: ".profile-card-extras #phone-view li",
                                opts: {
                                    processElement: d.parseSkypeC2CPhone
                                }
                            },
                            address: {
                                selector: ".profile-card-extras #address-view li",
                                opts: {
                                    textContent: true
                                }
                            },
                            webSite: {
                                selector: ".profile-card-extras #website-view li a",
                                opts: {
                                    href: true
                                }
                            },
                            liUrl: {
                                selector: ".profile-actions dl.public-profile dd a",
                                opts: {
                                    single: true
                                }
                            }
                        }
                    } else {
                        if (b.pageType === "old_connection") {
                            e = {
                                email: {
                                    selector: "#relationship-contact-info-section #relationship-emails-view li a"
                                },
                                phone: {
                                    selector: "#relationship-contact-info-section #relationship-phone-numbers-view li",
                                    opts: {
                                        processElement: d.parseSkypeC2CPhone
                                    }
                                },
                                address: {
                                    selector: "#relationship-contact-info-section #relationship-addresses-view li",
                                    opts: {
                                        textContent: true
                                    }
                                },
                                webSite: {
                                    selector: "#relationship-contact-info-section #relationship-sites-view li a",
                                    opts: {
                                        href: true
                                    }
                                },
                                liUrl: {
                                    selector: "#relationship-contact-info-section #contact-public-url-view li a",
                                    opts: {
                                        single: true
                                    }
                                }
                            }
                        } else {
                            if (b.pageType === "selfLegacy") {
                                e = {
                                    email: {
                                        selector: "#email .field-text li"
                                    },
                                    phone: {
                                        selector: "#phone .field-text li",
                                        opts: {
                                            processElement: d.parseSkypeC2CPhone
                                        }
                                    },
                                    address: {
                                        selector: "#address .field-text li"
                                    },
                                    webSite: {
                                        selector: "#website .field-text li"
                                    },
                                    liUrl: {
                                        selector: ".public-profile-section .public-profile-url",
                                        opts: {
                                            single: true
                                        }
                                    }
                                }
                            } else {
                                e = {
                                    webSite: {
                                        selector: ".www-presence #website li a"
                                    },
                                    liUrl: {
                                        selector: ".public-profile dd a",
                                        opts: {
                                            single: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var c = {
                        position: {
                            container: {
                                selector: "#background-experience-container"
                            },
                            item: {
                                selector: ".section-item"
                            },
                            title: {
                                selector: b.pageType === "selfLegacy" ? "h4 .field-text" : "h4 a"
                            },
                            company: {
                                selector: b.pageType === "selfLegacy" ? "h4 + h5 .field-text" : "h4 + h5 a"
                            },
                            startDate: {
                                selector: ".experience-date-locale time:first"
                            },
                            endDate: {
                                selector: ".experience-date-locale time:last"
                            }
                        }
                    };
                    var a = {};
                    if (b.pageType === "selfLegacy") {
                        a = {
                            education: {
                                container: {
                                    selector: "#background-education-container"
                                },
                                item: {
                                    selector: ".education"
                                },
                                school: {
                                    selector: "h4 .field-text"
                                },
                                degree: {
                                    selector: "h5 .field-text"
                                },
                                startDate: {
                                    selector: ".date-header-field time:first"
                                },
                                endDate: {
                                    selector: ".date-header-field time:last"
                                }
                            }
                        }
                    } else {
                        a = {
                            education: {
                                container: {
                                    selector: "#background-education-container"
                                },
                                item: {
                                    selector: ".education"
                                },
                                school: {
                                    selector: "h4 a"
                                },
                                degree: {
                                    selector: "h5"
                                },
                                startDate: {
                                    selector: ".education-date time:first"
                                },
                                endDate: {
                                    selector: ".education-date time:last"
                                }
                            }
                        }
                    }
                    b.selectors = Object.assign(f, e, c, a)
                }
            },
            li: {
                grab: function(b) {
                    if (document.location.origin.indexOf(LISTRING + ".com") < 0 || document.location.pathname.indexOf(LIRSTRING) >= 0 || $(".fn .full-name").length) {
                        return
                    }
                    var a = {};
                    a.pageType = "li";
                    a.contactInfoSelector = ".contact-see-more-less";
                    a.contactInfoLoadingElem = ".pv-contact-info__ci-container";
                    b.parsers.li.commonGrab(b, b.parsers.li, a)
                },
                isContactInfoExpanded: function(b, c, a) {
                    return $(".contact-see-more-less").attr("data-control-name") === "contact_see_less"
                },
                setProfilePageSelectors: function(b, c, a) {
                    a.selectors = {
                        name: {
                            selector: "h1.pv-top-card-section__name",
                            opts: {
                                single: true
                            }
                        },
                        email: {
                            selector: ".pv-contact-info__contact-type.ci-email .pv-contact-info__contact-item",
                            opts: {
                                textContent: true
                            }
                        },
                        phone: {
                            selector: ".pv-contact-info__contact-type.ci-phone .pv-contact-info__contact-item",
                            opts: {
                                processElement: b.parseSkypeC2CPhone
                            }
                        },
                        address: {
                            selector: ".pv-contact-info__contact-type.ci-address .pv-contact-info__ci-container a",
                            opts: {
                                textContent: true
                            }
                        },
                        webSite: {
                            selector: ".pv-contact-info__contact-type.ci-websites .pv-contact-info__ci-container a",
                            opts: {
                                href: true
                            }
                        },
                        liUrl: {
                            selector: ".pv-contact-info__contact-type.ci-vanity-url .pv-contact-info__contact-item",
                            opts: {
                                single: true
                            }
                        },
                        region: {
                            selector: "h3.pv-top-card-section__location",
                            opts: {
                                single: true
                            }
                        },
                        liProfilePictureUrl: {
                            selector: ".pv-top-card-section__photo img",
                            opts: {
                                src: true,
                                single: true
                            }
                        },
                        biography: [{
                            selector: ".pv-top-card-section__summary",
                            opts: {
                                single: true,
                                textContent: true
                            }
                        }, {
                            selector: ".pv-top-card-section__headline",
                            opts: {
                                single: true
                            }
                        }],
                        position: {
                            showMorePositionsButton: ".pv-profile-section.experience-section .pv-profile-section__see-more-inline",
                            showFewerPositionsButton: ".pv-profile-section.experience-section .pv-profile-section__see-less-inline",
                            container: {
                                selector: ".pv-profile-section.experience-section"
                            },
                            item: {
                                selector: ".pv-profile-section__card-item"
                            },
                            title: {
                                selector: ".pv-entity__summary-info h3"
                            },
                            company: {
                                selector: ".pv-entity__summary-info h4 .pv-entity__secondary-title"
                            },
                            startDate: {
                                selector: ".pv-entity__date-range time:first"
                            },
                            endDate: {
                                selector: ".pv-entity__date-range time:last"
                            }
                        },
                        education: {
                            container: {
                                selector: ".pv-profile-section.education-section"
                            },
                            item: {
                                selector: ".pv-profile-section__card-item"
                            },
                            school: {
                                selector: ".pv-entity__school-name"
                            },
                            degree: {
                                selector: ".pv-entity__degree-name .pv-entity__comma-item"
                            },
                            startDate: {
                                selector: ".pv-entity__dates time:first"
                            },
                            endDate: {
                                selector: ".pv-entity__dates time:last"
                            }
                        }
                    }
                },
                commonGrab: function(b, c, a) {
                    a.retries = 10;
                    b.result = null;
                    b.trace("LI(grabLi): page type=" + a.pageType);
                    b.status("Parsing contact info...", 3000);
                    b.parsers.li.commonExpandContactInfo(b, c, a)
                },
                commonExpandPositions: function(f, g, b) {
                    f.trace("LI(expandPositions): checking for additional positions");
                    var c = b.selectors.position;
                    if (typeof c.showMorePositionsButton === "undefined") {
                        f.trace("LI(expandPositions): no expansion");
                        setTimeout(function() {
                            f.parsers.li.commonParseProfilePage(f, g, b)
                        }, 100);
                        return
                    }
                    var a = $(c.showMorePositionsButton);
                    var e = $(c.showFewerPositionsButton);
                    if (e.length) {
                        var d = $(c.container.selector).find(c.item.selector).length;
                        if (typeof b._posCount === "undefined" || d > b._posCount) {
                            delete b._posCount;
                            if (!a.length) {
                                f.trace("LI(expandPositions): fully expanded");
                                setTimeout(function() {
                                    f.parsers.li.commonParseProfilePage(f, g, b)
                                }, 100);
                                return
                            }
                        }
                    }
                    if (a.length) {
                        if (typeof b._posCount === "undefined") {
                            b._posCount = $(c.container.selector).find(c.item.selector).length
                        }
                        f.trace("LI(expandPositions): loading additional positions");
                        f.status("Loading page...", 3000);
                        a.click();
                        b.retries = 20
                    } else {
                        if (typeof b._posCount === "undefined") {
                            f.trace("LI(expandPositions): nothing to expand");
                            setTimeout(function() {
                                f.parsers.li.commonParseProfilePage(f, g, b)
                            }, 100);
                            return
                        }
                    }
                    if (b.retries <= 0) {
                        f.trace("LI(expandPositions): no contact info area, parsing rest");
                        setTimeout(function() {
                            f.parsers.li.commonParseProfilePage(f, g, b)
                        }, 100)
                    } else {
                        setTimeout(function() {
                            f.parsers.li.commonExpandPositions(f, g, b)
                        }, 200)
                    }
                },
                commonSetProfilePageSelectors: function(b, c, a) {
                    c.setProfilePageSelectors(b, c, a);
                    a.retries = 20;
                    b.parsers.li.commonExpandPositions(b, c, a)
                },
                commonAwaitContactInfoExpansion: function(c, d, a) {
                    if (typeof d.setInitialSelectors !== "undefined") {
                        d.setInitialSelectors(c, d, a)
                    }
                    var b = $(a.contactInfoLoadingElem);
                    c.trace("LI(parsePageWhenAvailable): looking for " + a.contactInfoLoadingElem);
                    if (b.length || a.retries <= 0) {
                        c.trace("LI(parsePageWhenAvailable): " + a.contactInfoLoadingElem + (b.length ? " found" : " not found"));
                        setTimeout(function() {
                            c.parsers.li.commonSetProfilePageSelectors(c, d, a)
                        }, 100)
                    } else {
                        c.status("Processing...", 3000);
                        a.retries--;
                        setTimeout(function() {
                            c.parsers.li.commonAwaitContactInfoExpansion(c, d, a)
                        }, 100)
                    }
                },
                commonExpandContactInfo: function(c, d, a) {
                    var b = $(a.contactInfoSelector);
                    if (typeof d.isContactInfoExpanded !== "undefined") {
                        if (d.isContactInfoExpanded(c, d, a)) {
                            c.trace("LI(expandContactInfo): contact info area already open");
                            setTimeout(function() {
                                c.parsers.li.commonSetProfilePageSelectors(c, d, a)
                            }, 100);
                            return
                        }
                    }
                    if (b.length && typeof $._data(b.get(0), "events") === "undefined") {
                        c.trace("LI(expandContactInfo): opening contact info area");
                        b.click();
                        a.retries = 30;
                        c.parsers.li.commonAwaitContactInfoExpansion(c, d, a);
                        return
                    } else {
                        c.status("Processing...", 3000);
                        a.retries--
                    }
                    if (a.retries <= 0) {
                        c.trace("LI(expandContactInfo): no contact info area, parsing rest");
                        setTimeout(function() {
                            c.parsers.li.commonSetProfilePageSelectors(c, d, a)
                        }, 100)
                    } else {
                        setTimeout(function() {
                            c.parsers.li.commonExpandContactInfo(c, d, a)
                        }, 100)
                    }
                },
                commonParsePositions: function(d, e, b) {
                    var a = [];
                    var c = b.selectors.position;
                    d.trace("\nLI(parseLiPosition): parse positions, container selector $('" + c.container.selector + "') " + ($(c.container.selector).length ? "found" : "not found"));
                    d.trace("LI(parseLiPosition): parse positions, sub-selector $('" + c.item.selector + "') count=" + $(c.container.selector).find(c.item.selector).length);
                    $(c.container.selector).find(c.item.selector).each(function() {
                        var h = $(this);
                        var m = {};
                        var l = d.sanitizeText(h.find(c.title.selector).text());
                        if (l.length) {
                            m.title = l
                        }
                        d.trace("\nLI(parseLiPosition): parse position[title] sub-selector $('" + c.title.selector + "')=" + l);
                        var g = d.sanitizeText(h.find(c.company.selector).text());
                        if (g.length) {
                            m.company = g
                        }
                        d.trace("LI(parseLiPosition): parse position[company] sub-selector $('" + c.company.selector + "')=" + g);
                        var f = "";
                        var k = "";
                        if (typeof c.endDate.selector !== "undefined") {
                            f = d.sanitizeText(h.find(c.startDate.selector).text());
                            k = d.sanitizeText(h.find(c.endDate.selector).text())
                        } else {
                            var j = d.sanitizeText(h.find(c.startDate.selector).clone().children().remove().end().text()).split(/\s[-–]+\s/);
                            f = j[0] || "";
                            k = j[1] || ""
                        }
                        if (k == f) {
                            k = ""
                        }
                        d.parseMonthYearDate(m, f, "start");
                        d.trace("LI(parseLiPosition): parse position[start_date] sub-selector $('" + c.startDate.selector + "')=" + m.start_month + " " + m.start_year);
                        d.parseMonthYearDate(m, k, "end");
                        d.trace("LI(parseLiPosition): parse position[end_date] sub-selector $('" + c.endDate.selector + "')=" + m.end_month + " " + m.end_year);
                        a.push(m)
                    });
                    return a
                },
                commonParseEducation: function(c, e, a) {
                    var b = [];
                    var d = a.selectors.education;
                    c.trace("\nLI(parseLiProfilePage): parse education, container selector $('" + d.container.selector + "') " + ($(d.container.selector).length ? "found" : "not found"));
                    c.trace("LI(parseLiProfilePage): parse schools, sub-selector $('" + d.item.selector + "') count=" + $(d.container.selector).find(d.item.selector).length);
                    $(d.container.selector).find(d.item.selector).each(function() {
                        var k = $(this);
                        var h = {};
                        var g = c.sanitizeText(k.find(d.school.selector).text());
                        if (g.length) {
                            h.school = g
                        }
                        c.trace("\nLI(parseLiProfilePage): parse education[school] sub-selector$('" + d.school.selector + "')=" + g);
                        var j = c.sanitizeText(k.find(d.degree.selector).text());
                        if (j.length) {
                            h.degree = j.replace(/,$/, "")
                        }
                        c.trace("\nLI(parseLiProfilePage): parse education[degree] sub-selector$('" + d.degree.selector + "')=" + j);
                        if (typeof d.endDate.selector !== "undefined") {
                            startDate = c.sanitizeText(k.find(d.startDate.selector).text());
                            endDate = c.sanitizeText(k.find(d.endDate.selector).text())
                        } else {
                            var f = c.sanitizeText(k.find(d.startDate.selector).clone().children().remove().end().text()).split(/\s[-–]+\s/);
                            startDate = f[0] || "";
                            endDate = f[1] || ""
                        }
                        if (endDate == startDate) {
                            endDate = ""
                        }
                        c.parseMonthYearDate(h, startDate, "start");
                        delete h.start_month;
                        c.trace("LI(parseLiPosition): parse position[start_date] sub-selector $('" + d.startDate.selector + "')=" + h.start_year);
                        c.parseMonthYearDate(h, endDate, "end");
                        delete h.end_month;
                        c.trace("LI(parseLiPosition): parse position[end_date] sub-selector $('" + d.endDate.selector + "')=" + h.end_year);
                        b.push(h)
                    });
                    return b
                },
                commonParseProfilePage: function(d, a, r) {
                    d.trace("LI(parseProfilePage): parsing profile page", r);
                    a.setProfilePageSelectors(d, a, r);
                    var m = {};
                    var l = ["name", "email", "phone", "phoneType", "address", "webSite", "liUrl", "region", "liProfilePictureUrl", "biography"];
                    var p = r.selectors;
                    for (var h = 0; h < l.length; h++) {
                        var b = l[h];
                        var o = p[b];
                        if (o) {
                            if (o.constructor !== Array) {
                                o = [o]
                            }
                            for (var f = 0; f < o.length; f++) {
                                var c = o[f];
                                d.parseItems(m, b, c.selector, c.opts);
                                if (typeof m[b] !== "undefined") {
                                    break
                                }
                            }
                        }
                    }
                    m.position = d.parsers.li.commonParsePositions(d, a, r);
                    m.education = d.parsers.li.commonParseEducation(d, a, r);
                    if (typeof m.email !== "undefined") {
                        for (h = 0; h < m.email.length; h++) {
                            m.email[h] = {
                                value: m.email[h],
                                type: "other"
                            }
                        }
                    }
                    if (typeof m.phone !== "undefined") {
                        for (h = 0; h < m.phone.length; h++) {
                            var n = m.phone[h];
                            var q = "work";
                            var e = null;
                            if (typeof m.phoneType !== "undefined" && typeof m.phoneType[h] !== "undefined" && m.phoneType[h].length) {
                                e = [m.phoneType[h]];
                                n = n + m.phoneType[h];
                                m.phoneType[h] = null
                            } else {
                                e = n.match(/\(Work\)|\(Home\)|\(Mobile\)|\(Cell\)|\(Fax\)/i)
                            }
                            if (e != null) {
                                e = e[0];
                                if (e.indexOf("Home") > 0) {
                                    q = "home"
                                } else {
                                    if (e.indexOf("Mobile") > 0 || e.indexOf("Cell") > 0) {
                                        q = "mobile"
                                    } else {
                                        if (e.indexOf("Fax") > 0) {
                                            q = "fax"
                                        }
                                    }
                                }
                                n = n.replace(/\s*(\(Work\)|\(Home\)|\(Mobile\)|\(Cell\)|\(Fax\))/i, "")
                            }
                            m.phone[h] = {
                                type: q,
                                value: n
                            }
                        }
                    }
                    if (typeof m.webSite !== "undefined" && m.webSite.length) {
                        for (h = 0; h < m.webSite.length; h++) {
                            var k = "https://www." + LISTRING + ".com/redir/redirect?url=";
                            var g = m.webSite[h].replace(/&urlhash=.*/, "");
                            if (g.indexOf(k) >= 0) {
                                m.webSite[h] = decodeURIComponent(g.substring(k.length))
                            }
                        }
                    }
                    if (typeof m.liUrl !== "undefined" && m.liUrl.match(/^http/) == null) {
                        m.liUrl = "https://" + m.liUrl
                    }
                    if (typeof m.liProfilePictureUrl !== "undefined" && m.liProfilePictureUrl.length) {
                        m.liProfilePictureUrl = m.liProfilePictureUrl.replace(/mpr\/mpr\/shrink(np)?_[24]00_[24]00/, "media")
                    }
                    if (CG.Options.trace == "log") {
                        m.sourceHTML = document.body.innerHTML;
                        m.logData = CG.Grabber.logData
                    }
                    CG.Grabber.result = m;
                    CG.Grabber.complete()
                }
            }
        }
    }
}
$(document).ready(function() {
    CG.Grabber.grab()
});
if (typeof module !== "undefined") {
    module.exports = CG
};