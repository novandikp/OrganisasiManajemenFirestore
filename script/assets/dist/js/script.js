var SELECTOR_PUSHMENU_BTN = '[data-widget="pushmenu"]';
var SELECTOR_TOGGLE_BUTTON$1 = '[data-widget="pushmenu"]';
var NAME$5 = 'PushMenu';
var DATA_KEY$5 = 'lte.pushmenu';

// demo.js
$(document).on('collapsed.lte.pushmenu', '[data-widget="pushmenu"]', function () {
    $sidebar_collapsed_checkbox.prop('checked', true)
})
$(document).on('shown.lte.pushmenu', '[data-widget="pushmenu"]', function () {
    $sidebar_collapsed_checkbox.prop('checked', false)
})

// admin.js
$__default["default"](SELECTOR_PUSHMENU_BTN).on('collapsed.lte.pushmenu shown.lte.pushmenu', function () {
    setTimeout(function () {
        _this.fixLayoutHeight();
    }, 300);
});

var PushMenu = /*#__PURE__*/function () {
    function PushMenu(element, options) {
        this._element = element;
        this._options = $__default["default"].extend({}, Default$5, options);

        if ($__default["default"](SELECTOR_OVERLAY).length === 0) {
            this._addOverlay();
        }

        this._init();
    } // Public


    var _proto = PushMenu.prototype;

    _proto.expand = function expand() {
        var $bodySelector = $__default["default"](SELECTOR_BODY);

        if (this._options.autoCollapseSize && $__default["default"](window).width() <= this._options.autoCollapseSize) {
            $bodySelector.addClass(CLASS_NAME_OPEN$3);
        }

        $bodySelector.addClass(CLASS_NAME_IS_OPENING$1).removeClass(CLASS_NAME_COLLAPSED + " " + CLASS_NAME_CLOSED).delay(50).queue(function () {
            $bodySelector.removeClass(CLASS_NAME_IS_OPENING$1);
            $__default["default"](this).dequeue();
        });

        if (this._options.enableRemember) {
            localStorage.setItem("remember" + EVENT_KEY$2, CLASS_NAME_OPEN$3);
        }

        $__default["default"](this._element).trigger($__default["default"].Event(EVENT_SHOWN));
    };

    _proto.collapse = function collapse() {
        var _this = this;

        var $bodySelector = $__default["default"](SELECTOR_BODY);

        if (this._options.autoCollapseSize && $__default["default"](window).width() <= this._options.autoCollapseSize) {
            $bodySelector.removeClass(CLASS_NAME_OPEN$3).addClass(CLASS_NAME_CLOSED);
        }

        $bodySelector.addClass(CLASS_NAME_COLLAPSED);

        if (this._options.enableRemember) {
            localStorage.setItem("remember" + EVENT_KEY$2, CLASS_NAME_COLLAPSED);
        }

        $__default["default"](this._element).trigger($__default["default"].Event(EVENT_COLLAPSED$1));
        setTimeout(function () {
            $__default["default"](_this._element).trigger($__default["default"].Event(EVENT_COLLAPSED_DONE));
        }, this._options.animationSpeed);
    };

    _proto.toggle = function toggle() {
        if ($__default["default"](SELECTOR_BODY).hasClass(CLASS_NAME_COLLAPSED)) {
            this.expand();
        } else {
            this.collapse();
        }
    };

    _proto.autoCollapse = function autoCollapse(resize) {
        if (resize === void 0) {
            resize = false;
        }

        if (!this._options.autoCollapseSize) {
            return;
        }

        var $bodySelector = $__default["default"](SELECTOR_BODY);

        if ($__default["default"](window).width() <= this._options.autoCollapseSize) {
            if (!$bodySelector.hasClass(CLASS_NAME_OPEN$3)) {
                this.collapse();
            }
        } else if (resize === true) {
            if ($bodySelector.hasClass(CLASS_NAME_OPEN$3)) {
                $bodySelector.removeClass(CLASS_NAME_OPEN$3);
            } else if ($bodySelector.hasClass(CLASS_NAME_CLOSED)) {
                this.expand();
            }
        }
    };

    _proto.remember = function remember() {
        if (!this._options.enableRemember) {
            return;
        }

        var $body = $__default["default"]('body');
        var toggleState = localStorage.getItem("remember" + EVENT_KEY$2);

        if (toggleState === CLASS_NAME_COLLAPSED) {
            if (this._options.noTransitionAfterReload) {
                $body.addClass('hold-transition').addClass(CLASS_NAME_COLLAPSED).delay(50).queue(function () {
                    $__default["default"](this).removeClass('hold-transition');
                    $__default["default"](this).dequeue();
                });
            } else {
                $body.addClass(CLASS_NAME_COLLAPSED);
            }
        } else if (this._options.noTransitionAfterReload) {
            $body.addClass('hold-transition').removeClass(CLASS_NAME_COLLAPSED).delay(50).queue(function () {
                $__default["default"](this).removeClass('hold-transition');
                $__default["default"](this).dequeue();
            });
        } else {
            $body.removeClass(CLASS_NAME_COLLAPSED);
        }
    } // Private
        ;

    _proto._init = function _init() {
        var _this2 = this;

        this.remember();
        this.autoCollapse();
        $__default["default"](window).resize(function () {
            _this2.autoCollapse(true);
        });
    };

    _proto._addOverlay = function _addOverlay() {
        var _this3 = this;

        var overlay = $__default["default"]('<div />', {
            id: 'sidebar-overlay'
        });
        overlay.on('click', function () {
            _this3.collapse();
        });
        $__default["default"](SELECTOR_WRAPPER).append(overlay);
    } // Static
        ;

    PushMenu._jQueryInterface = function _jQueryInterface(operation) {
        return this.each(function () {
            var data = $__default["default"](this).data(DATA_KEY$5);

            var _options = $__default["default"].extend({}, Default$5, $__default["default"](this).data());

            if (!data) {
                data = new PushMenu(this, _options);
                $__default["default"](this).data(DATA_KEY$5, data);
            }

            if (typeof operation === 'string' && /collapse|expand|toggle/.test(operation)) {
                data[operation]();
            }
        });
    };

    return PushMenu;
}();


/**
 * Data API
 * ====================================================
 */


$__default["default"](document).on('click', SELECTOR_TOGGLE_BUTTON$1, function (event) {
    event.preventDefault();
    var button = event.currentTarget;

    if ($__default["default"](button).data('widget') !== 'pushmenu') {
        button = $__default["default"](button).closest(SELECTOR_TOGGLE_BUTTON$1);
    }

    PushMenu._jQueryInterface.call($__default["default"](button), 'toggle');
});
$__default["default"](window).on('load', function () {
    PushMenu._jQueryInterface.call($__default["default"](SELECTOR_TOGGLE_BUTTON$1));
});
/**
 * jQuery API
 * ====================================================
 */

$__default["default"].fn[NAME$5] = PushMenu._jQueryInterface;
$__default["default"].fn[NAME$5].Constructor = PushMenu;

$__default["default"].fn[NAME$5].noConflict = function () {
    $__default["default"].fn[NAME$5] = JQUERY_NO_CONFLICT$5;
    return PushMenu._jQueryInterface;
};

var Default = {
    trigger: SELECTOR_DATA_WIDGET + " " + SELECTOR_LINK,
    animationSpeed: 300,
    accordion: true,
    expandSidebar: false,
    sidebarButtonSelector: '[data-widget="pushmenu"]'
};

_proto._expandSidebar = function _expandSidebar() {
    if ($__default["default"]('body').hasClass(CLASS_NAME_SIDEBAR_COLLAPSED)) {
        $__default["default"](this._config.sidebarButtonSelector).PushMenu('expand');
    }
}; // Static;

exports.PushMenu = PushMenu;