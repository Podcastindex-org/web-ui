var tc_ex_rates

window.onload = function () {
    tallypay_start()
}

function tallypay_start() {
    const ss = document.getElementsByTagName('link')
    var ss_count = 0
    for (let i = 0; i < ss.length; i++) {
        var count =
            count + (ss[i].getAttribute('href').match(/tallypay/g) || []).length
    }
    if (ss_count == 0) {
        // Add CSS stylesheet to <head>
        link = document.createElement('link')
        link.href = 'https://tallyco.in/css/tallypay.css?v=2.1.4'
        link.rel = 'stylesheet'
        document.getElementsByTagName('head')[0].appendChild(link)
    }

    if (typeof tc_logged_in_as !== 'undefined') {
        var logged_in_as = tc_logged_in_as
    } else {
        var logged_in_as = ''
    }
    init_tallypay_widget(logged_in_as)
}

function init_tallypay_widget(logged_in_as) {
    var widget = document.getElementsByClassName('tallypay')

    Array.prototype.forEach.call(widget, function (el) {
        var htmlid = el.dataset.user + '-' + Math.floor(Math.random() * 2000)
        el.setAttribute('id', 'tc_panel_' + htmlid)
        document.getElementById('tc_panel_' + htmlid).innerHTML = ''

        // Get customizations from data-* attributes
        if (el.dataset.ex_rates == 'exclude') {
            var e = 'N'
        } else {
            var e = 'Y'
        }
        var theme = 'light'
        if (
            typeof el.dataset.theme !== 'undefined' &&
            (el.dataset.theme == 'light' || el.dataset.theme == 'dark')
        ) {
            var theme = el.dataset.theme
        }
        var button_text = ''
        var clickable_image = ''
        var success_callback = ''
        if (el.dataset.size == 'button') {
            if (el.dataset.button_text != '') {
                var button_text = el.dataset.button_text
            }
            var s = 'Y'
        } else {
            var s = 'N'
        }
        if (typeof el.dataset.image !== 'undefined') {
            var clickable_image = el.dataset.image
        }
        if (typeof el.dataset.onpayment !== 'undefined') {
            var success_callback = el.dataset.onpayment
        }

        this[htmlid] = new tallypay(
            el.dataset.user,
            el.dataset.fundid,
            e,
            s,
            button_text,
            clickable_image,
            htmlid,
            theme,
            success_callback,
            logged_in_as
        )
    })
}

var tallypay = function (
    user,
    fundid,
    ex_rates_inc,
    is_button,
    button_text,
    clickable_image,
    htmlid,
    theme,
    success_callback,
    logged_in_as
) {
    var fundtimer, paytimer, tc_spinner
    var paychk = ''
    var conw = ''
    var conc = ''
    var minw = 400
    var maxw = 600
    var maxh = 570
    var minh = 470
    if (is_button == 'Y') {
        var minw = 300
    }

    addHTMLtoBody()

    if (logged_in_as == '') {
        document.getElementById('public_chkbox-' + htmlid).checked = true
    }

    if (fundid === undefined) {
        call_api('username=' + user, '/v1/user/default_fundraiser/index.php')
    } else {
        call_api('fundraiser_id=' + fundid, '/v1/fundraiser/index.php')
    }

    function call_api(params, endpoint) {
        var api_source = 'https://api.tallyco.in' + endpoint

        var xhr = new XMLHttpRequest()

        if (
            endpoint == '/v1/fundraiser/index.php' ||
            endpoint == '/v1/user/default_fundraiser/index.php'
        ) {
            xhr.onload = function () {
                if (
                    this.response.hasOwnProperty('error') ||
                    this.response == 'null'
                ) {
                    tc_error_page(this.response.error)
                } else {
                    doProfile(this.response)
                }
            }
        }

        if (endpoint == '/v1/payment/request/index.php') {
            xhr.onload = function () {
                if (this.response == null) {
                    tc_error_page('Try again.')
                } else {
                    if (this.response.hasOwnProperty('error')) {
                        tc_error_page(this.response.error)
                    } else {
                        tc_pay_page(this.response)
                    }
                }
            }
        }

        if (endpoint == '/v1/payment/verify/index.php') {
            xhr.onload = function () {
                verifyPayment(this.response)
            }
        }

        xhr.open('POST', api_source)
        xhr.setRequestHeader(
            'Content-Type',
            'application/x-www-form-urlencoded'
        )
        xhr.responseType = 'json'
        xhr.send(params)
    }

    function addHTMLtoBody() {
        var html = ''
        var btn = ''

        if (is_button == 'Y' || clickable_image != '') {
            if (clickable_image != '') {
                btn += '<div id="tc_tip_button-' + htmlid + '">'
                btn +=
                    '	<div style="display:inline-block;cursor:pointer;"><img src="' +
                    clickable_image +
                    '"></div>'
            } else {
                btn +=
                    '<div id="tc_tip_button-' +
                    htmlid +
                    '" class="tc_tip_button">'
                btn +=
                    '	<div style="display:inline-block">' +
                    button_text +
                    '</div>'
            }
            btn += '	</div>'

            html += '<div id="tc_overlay-' + htmlid + '" class="tc_overlay_bg">'
            html +=
                '	<div id="tc_cls_overlay-' +
                htmlid +
                '" class="tc_close_overlay">&times;</div>'
            html += '	<div class="tc_perfect_center">'
        }

        html += '<div id="tc_flipper-' + htmlid + '">'
        html += '	<input type="hidden" id="tc_to_copy-' + htmlid + '">'
        html += '	<input type="hidden" id="tc_sec_rem-' + htmlid + '">	'
        html += '	<input type="hidden" id="tc_sat_pending-' + htmlid + '">'
        html += '	<input type="hidden" id="tc_pay_method-' + htmlid + '">'
        html += '	<input type="hidden" id="tc_payment_id-' + htmlid + '">'

        html +=
            '	<div class="tc_padfive tc_bbox tc_loading theme_' +
            theme +
            '" id="tc_spinner-' +
            htmlid +
            '"><div class="tc_spinner rotate"></div><div style="font-size:1.5rem;font-weight:600;">please wait</div></div>'

        html +=
            '	<div id="tc_front-' +
            htmlid +
            '" class="theme_' +
            theme +
            ' tc_padfive tc_bbox tc_bbox-' +
            htmlid +
            '">	'

        html +=
            '		<div class="tc_hidden theme_' +
            theme +
            '" id="tc_loaded-' +
            htmlid +
            '" style="display:none">'

        html += '			<div id="tc_keypad_panel-' + htmlid + '">'

        html += '				<div class="tc_pr_title_box">'
        html +=
            '					<div class="tc_profile_img tc_centered" id="tc_profile_img-' +
            htmlid +
            '"></div>'
        html += '				</div>'

        html += '				<div class="tc_name_box">'
        html += '					<div class="tc_send_bitcoin_to">Send Bitcoin to</div>'
        html +=
            '					<div class="tc_profile_name" id="tc_profile_name-' +
            htmlid +
            '"></div>'
        html += '				</div>'

        html += '				<div class="tc_keypad_wrapper">'
        html += '					<div class="tc_keypad_input tc_centered">'
        html +=
            '					<div style="float:left"><input class="tc_input" id="tc_donate_amount_val-' +
            htmlid +
            '" placeholder="0"></div>'
        html += '					<div class="tc_right_float">satoshis</div>'
        html += '					<div style="clear:both"></div>'
        html += '				</div>'

        html +=
            '				<div id="tc_preset_keypad-' +
            htmlid +
            '" class="tc_keypad_grid tc_centered">'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_cell_rtl tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_50-' +
            htmlid +
            '">50<span class="tc_sym">c</span></div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_100-' +
            htmlid +
            '"><span class="tc_sym">$</span>1</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_cell_rtr tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_200-' +
            htmlid +
            '"><span class="tc_sym">$</span>2</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_500-' +
            htmlid +
            '"><span class="tc_sym">$</span>5</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_1000-' +
            htmlid +
            '"><span class="tc_sym">$</span>10</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_1500-' +
            htmlid +
            '"><span class="tc_sym">$</span>15</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_2000-' +
            htmlid +
            '"><span class="tc_sym">$</span>20</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_3000-' +
            htmlid +
            '"><span class="tc_sym">$</span>30</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_4000-' +
            htmlid +
            '"><span class="tc_sym">$</span>40</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_r tc_cell_rbl tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_5000-' +
            htmlid +
            '"><span class="tc_sym">$</span>50</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_r tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_10000-' +
            htmlid +
            '"><span class="tc_sym">$</span>100</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_rbr tc_ps-' +
            htmlid +
            '" id="tc_pkeypad_20000-' +
            htmlid +
            '"><span class="tc_sym">$</span>200</div>'
        html += '				</div>'

        html +=
            '				<div id="tc_item_keypad-' +
            htmlid +
            '" class="tc_keypad_grid tc_centered" style="display:none">'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_cell_rtl tc_cell_rtr tc_itm-' +
            htmlid +
            '" id="tc_ikeypad_300-' +
            htmlid +
            '" style="width: 100%;">Coffee <span class="tc_sym">($3)</span></div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_itm-' +
            htmlid +
            '" id="tc_ikeypad_1500-' +
            htmlid +
            '" style="width: 100%;">Lunch <span class="tc_sym">($15)</span></div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_itm-' +
            htmlid +
            '" id="tc_ikeypad_5000-' +
            htmlid +
            '" style="width: 100%;">Dinner <span class="tc_sym">($50)</span></div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_cell_rbl tc_cell_rbr tc_itm-' +
            htmlid +
            '" id="tc_ikeypad_10000-' +
            htmlid +
            '" style="border-bottom: 1px solid #e4e3f9;width: 100%;">Gift <span class="tc_sym">($100)</span></div>'
        html += '				</div>'

        html +=
            '				<div id="tc_custom_keypad-' +
            htmlid +
            '" class="tc_keypad_grid tc_centered" style="display:none">'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_cell_rtl tc_kp-' +
            htmlid +
            '" id="tc_keypad_1-' +
            htmlid +
            '">1</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_kp-' +
            htmlid +
            '" id="tc_keypad_2-' +
            htmlid +
            '">2</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_cell_rtr tc_kp-' +
            htmlid +
            '" id="tc_keypad_3-' +
            htmlid +
            '">3</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_kp-' +
            htmlid +
            '" id="tc_keypad_4-' +
            htmlid +
            '">4</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_kp-' +
            htmlid +
            '" id="tc_keypad_5-' +
            htmlid +
            '">5</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_kp-' +
            htmlid +
            '" id="tc_keypad_6-' +
            htmlid +
            '">6</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_kp-' +
            htmlid +
            '" id="tc_keypad_7-' +
            htmlid +
            '">7</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_br tc_kp-' +
            htmlid +
            '" id="tc_keypad_8-' +
            htmlid +
            '">8</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_b tc_kp-' +
            htmlid +
            '" id="tc_keypad_9-' +
            htmlid +
            '">9</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_r tc_cell_rbl tc_kp-' +
            htmlid +
            '" id="tc_keypad_dot-' +
            htmlid +
            '">.</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_r tc_kp-' +
            htmlid +
            '" id="tc_keypad_0-' +
            htmlid +
            '">0</div>'
        html +=
            '					<div class="tc_keypad_cell tc_keypad_cell_' +
            theme +
            ' tc_cell_rbr tc_kp-' +
            htmlid +
            '" id="tc_keypad_back-' +
            htmlid +
            '"><img src="https://tallyco.in/img/backspace.svg" style="width:30px; height:30px; margin-top:0.3em"></div>'
        html += '				</div>'

        html += '				<div class="tc_block">'
        html +=
            '					<div class="tc_donate_denom"><select id="tc_currency_list-' +
            htmlid +
            '" class="tc_select_light"></select></div>'
        html +=
            '					<div class="tc_fiat_amount"><span id="tc_fiat_value-' +
            htmlid +
            '"></span></div>'
        html += '					<div style="clear:both"></div>'
        html += '				</div>'

        var la = ''
        if (
            logged_in_as == '' &&
            (window.location.hostname == 'localhost' ||
                window.location.hostname == 'tallyco.in' ||
                window.location.hostname == 'tallycoin.app')
        ) {
            var la =
                '<span class="loginlink" onclick="navLoginOptions()">or login</span>'
        }
        if (logged_in_as == '') {
            var ch = 'checked disabled'
        } else {
            var ch = ''
        }

        html += '				<div class="tc_block">'
        html +=
            '					<div class="tc_message_box"><textarea id="tc_message-' +
            htmlid +
            '" type="text" placeholder="Type a Public Message (optional) ..." style="resize: none;" maxlength="140"></textarea></div>'
        html += '					<div class="tc_block">'
        html +=
            '						<div class="tc_chkbox" style="float:left;position:relative;"> <input id="public_chkbox-' +
            htmlid +
            '" name="public_chkbox-' +
            htmlid +
            '" type="checkbox" ' +
            ch +
            '><span class="tc_checkmark"></span> </div> <div class="tc_tag_me"><label for="public_chkbox-' +
            htmlid +
            '" class="noselect">anonymous</label>' +
            la +
            '</div>'
        html +=
            '						<div class="tc_char_count" id="tc_char_count-' +
            htmlid +
            '">140</div>'
        html += '						<div style="clear:both"></div>'
        html += '					</div>'
        html += '				</div>'

        html += '				<div class="tc_pay_method_boxes">'
        html +=
            '					<div class="tc_don_btn_wr"><div id="tc_btc_don_btn-' +
            htmlid +
            '" class="tc_don_click-' +
            htmlid +
            ' tc_donate_btn tc_btn"><img src="https://tallyco.in/img/chain.svg"><span>on-chain</span></div></div>'
        html +=
            '					<div class="tc_don_btn_wr" style="margin-left: 1.5%;" id="tc_ln_b_w-' +
            htmlid +
            '"><div id="tc_ln_don_btn-' +
            htmlid +
            '" class="tc_don_click-' +
            htmlid +
            ' tc_donate_btn tc_btn"><img src="https://tallyco.in/img/lightning.svg"><span>lightning</span></div></div>'
        html += '					<div style="clear:both"></div>'
        html += '				</div>'

        html += '			</div>'

        html += '		</div>	'

        html += '		<div id="tc_error_panel-' + htmlid + '">'
        html += '			<div class="tc_padfive">'
        html += '				<div class="tc_credit_content tc_font_bold">'
        html += '					ERROR<br/>'
        html +=
            '					<img src="https://tallyco.in/img/tallycoin-spinner.png" style="width:100px;height:100px;"><br/>'
        html +=
            '					<div class="tc_error_button_text" id="tc_error_button_text-' +
            htmlid +
            '"></div>'
        html +=
            '					<div class="tc_flz"><a id="tc_error_back-' +
            htmlid +
            '" class="tc_link"><div class="tc_btn_txt tc_font_bold"><img src="https://tallyco.in/img/left-arrow-light.svg" style="width:10px;height:10px;">  back</div></a></div>'
        html += '				</div>'
        html += '			</div>'
        html += '		</div>	'

        html += '	</div>	'

        // end front

        html += '</div>	'

        html +=
            '	<div id="tc_back-' +
            htmlid +
            '" class="tc_bbox tc_bbox-' +
            htmlid +
            ' theme_' +
            theme +
            '" style="display:none">'

        html +=
            '		<div class="tc_hidden theme_' +
            theme +
            '" id="tc_pay_page-' +
            htmlid +
            '">'
        html += '			<div class="tc_padfive">'
        html +=
            '			<div class="tc_flz"><a id="tc_pay_back-' +
            htmlid +
            '" class="tc_link"><div class="tc_btn_txt tc_font_bold"><img src="https://tallyco.in/img/left-arrow-light.svg" style="width:10px;height:10px;">  back</div></a></div>'
        html +=
            '			<div class="tc_flz"><a id="tc_paid_back-' +
            htmlid +
            '" class="tc_link"><div class="tc_btn_txt tc_font_bold"><img src="https://tallyco.in/img/left-arrow-light.svg" style="width:10px;height:10px;">  back</div></a></div>'
        html +=
            '			<div style="display:inline-block;float:right;"><a id="tc_pay_back-' +
            htmlid +
            '" class="tc_link"><div class="tc_btn_txt tc_font_bold tc_pay_timer" id="tc_pay_timer-' +
            htmlid +
            '"></div></a></div>'
        html += '			<div style="clear:both;margin-bottom:5px;"></div>'

        html +=
            '			<div class="tc_block" id="prev_message_wr-' +
            htmlid +
            '" style="text-align:center;">'
        html +=
            '				<div class="tc_profile_name" style="margin-bottom:40px;">Preview</div>'
        html += '				<div class="tc_block">'
        html +=
            '					<div class="tc_message_avatar" id="prev_message_avatar-' +
            htmlid +
            '"></div>'
        html +=
            '					<div class="tc_message" id="prev_message_txt-' +
            htmlid +
            '"></div>'
        html += '				</div>'
        html += '			</div>'

        html += '			<div class="tc_wide_txt_c" id="qr_code_wr-' + htmlid + '">	'
        html +=
            '				<div class="tc_profile_name" style="margin:40px 0 40px 0;">Scan to Pay</div>'
        html +=
            '				<div id="tc_qr-' +
            htmlid +
            '" class="tc_qr_code"><div class="tc_copied" id="tc_copied-' +
            htmlid +
            '">COPIED</div></div>'
        html +=
            '				<div style="display:block;text-align:center;"><div class="tc_send_exact" id="tc_exact-' +
            htmlid +
            '"></div></div>'
        html +=
            '				<div id="tc_ow-' +
            htmlid +
            '"><a id="tc_open_wallet-' +
            htmlid +
            '" class="tc_wallet_btn tc_med_font tc_font_bold">Open In Wallet</a></div>'
        html += '			</div>'

        html += '			<div class="tc_wide_txt_c" id="fallback_note-' + htmlid + '">'
        html +=
            '				<div id="tc_fallback-' +
            htmlid +
            '" class="tc_regen_btn tc_sm_font" style="margin-top:40px;color:#bb0000;"><b>Trouble Paying?</b><br/>Regenerate QR Code</div>'
        html += '			</div>'

        html +=
            '			<div class="tc_profile_name tc_pay_img" id="tc_paid_button_text-' +
            htmlid +
            '">Paid<br/><img id="tc_paid_gif-' +
            htmlid +
            '" class="paid_gif" src=""></div>'
        html +=
            '			<div class="tc_profile_name tc_pay_img" id="tc_no_pay_vid-' +
            htmlid +
            '">Sorry. Time\'s Up.<br/><img id="tc_no_pay_gif-' +
            htmlid +
            '" class="paid_gif" src=""></div>'

        html += '		</div>'

        html += '	</div>'

        // end back

        if (is_button == 'Y' || clickable_image != '') {
            btn += '</div></div>'
            document.getElementById('tc_panel_' + htmlid).innerHTML = btn
            const div = document.createElement('div')
            div.style.cssText = 'position:relative;z-index:9999;display:none;'
            div.innerHTML = html
            div.id = 'tc_overlay_wrapper_' + htmlid
            document.getElementsByTagName('body')[0].appendChild(div)
        } else {
            document.getElementById('tc_panel_' + htmlid).innerHTML = html
        }
    }

    function tc_error_page(error) {
        user = 'error'
        insertHTML()
        hidePanels()
        document.getElementById('tc_front-' + htmlid).style.display = 'block'
        document.getElementById('tc_keypad_panel-' + htmlid).style.display =
            'none'
        document.getElementById('tc_error_panel-' + htmlid).style.display =
            'block'
        document.getElementById(
            'tc_error_button_text-' + htmlid
        ).innerHTML = error
    }

    function insertHTML() {
        document.getElementById('tc_spinner-' + htmlid).style.display = 'none'
        document.getElementById('tc_loaded-' + htmlid).style.display = 'block'
        tc_spinner = 'OFF'

        if (is_button == 'Y' || clickable_image != '') {
            document.getElementById('tc_overlay-' + htmlid).style.display =
                'none'
            document.getElementById('tc_tip_button-' + htmlid).style.display =
                'inline-block'
        }
        if (user != 'error') {
            document.getElementById('tc_error_panel-' + htmlid).style.display =
                'none'
        }

        var b = document
            .getElementById('tc_panel_' + htmlid)
            .getBoundingClientRect()

        if (is_button != 'Y') {
            var c = document.getElementsByClassName('tc_bbox')
            Array.prototype.forEach.call(c, function (el) {
                if (b.height == 0 || clickable_image != '') {
                    var h = 900
                } else {
                    var h = b.height + 30
                }
                document.getElementById(el.id).style.height = h + 'px'
                if (b.width == 0) {
                    var w = 400
                } else {
                    var w = b.width
                }
                document.getElementById(el.id).style.width = w + 'px'
            })
        }
    }

    function populateCurrencies(exchange_rates) {
        var tc_tc_ex_rates = document.getElementById(
            'tc_currency_list-' + htmlid
        )

        for (var ticker in exchange_rates) {
            var option = document.createElement('option')
            option.text = ticker
            option.value = ticker
            if (ticker == 'BTC') {
                option.selected = 'selected'
            }
            tc_tc_ex_rates.appendChild(option)
        }
    }

    function trunc_string(string, max_length) {
        if (string.length > max_length) {
            var fixed_length = max_length
            var e = '...'
        } else {
            var fixed_length = string.length
            var e = ''
        }
        return string.substring(0, fixed_length) + e
    }

    function clickables(fown_handle, fown_name) {
        var c = document.getElementsByClassName('tc_itm-' + htmlid)
        Array.prototype.forEach.call(c, function (el) {
            document.getElementById(el.id).onclick = function () {
                tc_keypad_preset(el.id, 'i')
            }
        })
        var c = document.getElementsByClassName('tc_ps-' + htmlid)
        Array.prototype.forEach.call(c, function (el) {
            document.getElementById(el.id).onclick = function () {
                tc_keypad_preset(el.id, 'p')
            }
        })
        var c = document.getElementsByClassName('tc_kp-' + htmlid)
        Array.prototype.forEach.call(c, function (el) {
            document.getElementById(el.id).onclick = function () {
                tc_keypad_press(el.id)
            }
        })
        var c = document.getElementsByClassName('tc_don_click-' + htmlid)
        Array.prototype.forEach.call(c, function (el) {
            document.getElementById(el.id).onclick = function () {
                tc_donate_amount('show')
            }
        })

        document.getElementById('tc_message-' + htmlid).onkeyup = function () {
            tc_char_count(htmlid)
        }
        document.getElementById(
            'tc_donate_amount_val-' + htmlid
        ).onkeyup = function () {
            tc_denom()
        }
        document.getElementById(
            'tc_currency_list-' + htmlid
        ).onchange = function () {
            tc_denom()
        }

        document.getElementById('tc_pay_back-' + htmlid).onclick = function () {
            tc_pay_back()
        }
        document.getElementById(
            'tc_error_back-' + htmlid
        ).onclick = function () {
            tc_pay_back()
        }
        document.getElementById(
            'tc_paid_back-' + htmlid
        ).onclick = function () {
            tc_donate_amount('hide')
            tc_pay_back()
        }
        document.getElementById('tc_fallback-' + htmlid).onclick = function () {
            tc_fallback()
        }

        document.getElementById(
            'tc_btc_don_btn-' + htmlid
        ).onclick = function () {
            tc_get_pay_request('btc', '')
        }
        document.getElementById(
            'tc_ln_don_btn-' + htmlid
        ).onclick = function () {
            tc_get_pay_request('ln', '')
        }
        document.getElementById('tc_qr-' + htmlid).onclick = function () {
            tc_copyToClipboard(htmlid)
        }
        if (is_button == 'Y' || clickable_image != '') {
            document.getElementById(
                'tc_tip_button-' + htmlid
            ).onclick = function () {
                tc_btn_clicked()
                tc_donate_amount('show')
            }
            document.getElementById(
                'tc_cls_overlay-' + htmlid
            ).onclick = function () {
                tc_overlay_close()
            }
        }
    }

    function tc_fallback() {
        tc_pay_back()
        tc_get_pay_request('ln', 'Y')
    }

    function tc_btn_clicked() {
        document.getElementById('tc_overlay_wrapper_' + htmlid).style.display =
            'inherit'
        document.getElementById('tc_overlay-' + htmlid).style.display = 'block'
    }

    function tc_overlay_close() {
        document.getElementById('tc_overlay-' + htmlid).style.display = 'none'
    }

    function doProfile(fdata) {
        if (tc_spinner != 'OFF') {
            insertHTML()
            clickables(
                fdata.fundraiser_owner_handle,
                fdata.fundraiser_owner_name
            )
            if (fdata.lightning_available == 'N') {
                document.getElementById(
                    'tc_ln_don_btn-' + htmlid
                ).style.display = 'none'
            }
            populateCurrencies(fdata.exchange_rate)
            tc_ex_rates = fdata.exchange_rate
        }
        if (fundid === undefined) {
            var l = fdata.fundraiser_url
            fundid = l.replace('https://tallyco.in/s/', '')
        }

        var profile_url =
            'https://tallyco.in/' + fdata.fundraiser_owner_handle + '/'
        document
            .getElementById('tc_profile_img-' + htmlid)
            .setAttribute(
                'style',
                "background:url('" +
                    fdata.fundraiser_owner_avatar +
                    "');background-size:120px 120px;cursor:pointer;"
            )
        document.getElementById(
            'tc_profile_img-' + htmlid
        ).onclick = function () {
            window.open(profile_url, '_self')
        }
        document.getElementById(
            'tc_profile_name-' + htmlid
        ).innerHTML = trunc_string(fdata.fundraiser_owner_name, 31)
    }

    function prettyTime(time) {
        var seconds = parseInt(time, 10)
        var days = Math.floor(seconds / (3600 * 24))
        seconds -= days * 3600 * 24
        var hrs = Math.floor(seconds / 3600)
        seconds -= hrs * 3600
        var mnts = Math.floor(seconds / 60)
        seconds -= mnts * 60
        if (days > 0) {
            return days + ' days ' + hrs + ' hrs ' + mnts + ' mins'
        } else {
            return hrs + ' hrs ' + mnts + ' mins ' + seconds + ' secs'
        }
    }

    function tc_donate_amount(state) {
        if (state != 'show') {
            setTimeout(function () {
                document.getElementById('tc_paid_gif-' + htmlid).src = ''
                document.getElementById('tc_no_pay_gif-' + htmlid).src = ''
                document.getElementById('tc_pay_page-' + htmlid).style.display =
                    'none'
                document.getElementById('tc_loaded-' + htmlid).style.display =
                    'block'
            }, 200)
        }
    }

    function tc_char_count(htmlid) {
        var message = document.getElementById('tc_message-' + htmlid).value
        var remaining = 140 - message.length
        document.getElementById('tc_char_count-' + htmlid).innerHTML = remaining
        if (remaining < 30) {
            var c = '#f29a9a'
        } else {
            var c = '#e3e3e3'
        }
        document.getElementById(
            'tc_char_count-' + htmlid
        ).style.backgroundColor = c
    }

    function tc_pay_back() {
        document.getElementById('tc_error_panel-' + htmlid).style.display =
            'none'
        document.getElementById('tc_pay_page-' + htmlid).style.display = 'none'
        document.getElementById('tc_back-' + htmlid).style.display = 'none'
        document.getElementById('tc_front-' + htmlid).style.display = 'block'
        document.getElementById('tc_keypad_panel-' + htmlid).style.display =
            'block'
        clearInterval(paytimer)
    }

    function tc_keypad_press(id) {
        var c = id.replace('-' + htmlid, '')
        var num = c.replace('tc_keypad_', '')
        var v = document.getElementById('tc_donate_amount_val-' + htmlid).value
        if (num == 'dot') {
            num = '.'
        }
        if (num == 'back') {
            v = v.toString().substring(0, v.length - 1)
            num = ''
        }
        document.getElementById('tc_donate_amount_val-' + htmlid).value =
            v + num
        tc_denom()
    }

    function tc_keypad_preset(id, i) {
        var c = id.replace('-' + htmlid, '')
        var cents = c.replace('tc_' + i + 'keypad_', '')
        var v = Math.ceil(
            ((cents / 100) * 100000000) / parseFloat(tc_ex_rates['USD'].rate)
        )
        document.getElementById('tc_donate_amount_val-' + htmlid).value = v
        tc_denom()
    }

    function tc_denom() {
        var donation_amount = document.getElementById(
            'tc_donate_amount_val-' + htmlid
        ).value
        if (donation_amount == '') {
            donation_amount = ''
        }
        donation_amount = donation_amount.toString().replace(/[^0-9.]*/g, '')
        donation_amount = donation_amount.replace(/./g, function (a, n, str) {
            if (a == '.') {
                return str.indexOf(a) == n ? a : ''
            } else {
                return str.indexOf(a) == n ? a : a
            }
        })
        document.getElementById(
            'tc_donate_amount_val-' + htmlid
        ).value = donation_amount

        var fiat_value = tc_approx_fiat_value()
        if (fiat_value[0] == 'NaN') {
            fiat_value[0] = 0
        }
        if (fiat_value[1] != 'SAT') {
            document.getElementById('tc_fiat_value-' + htmlid).innerHTML =
                'Approx: ' + fiat_value[0] + ' ' + fiat_value[1]
        } else {
            document.getElementById('tc_fiat_value-' + htmlid).innerHTML = ''
        }
    }

    function tc_approx_fiat_value() {
        var donation_amount = document.getElementById(
            'tc_donate_amount_val-' + htmlid
        ).value
        var denom = document.getElementById('tc_currency_list-' + htmlid)
        var denom = denom.options[denom.selectedIndex].value
        if (denom == 'BTC') {
            var conv = 1
            var fixed = 8
        } else {
            var conv = 0.00000001
            var fixed = 2
        }
        var v =
            parseFloat(donation_amount) *
            parseFloat(tc_ex_rates[denom].rate) *
            conv
        return [v.toFixed(fixed), denom]
    }

    function hidePanels() {
        var x = document.querySelectorAll('.tc_hidden')
        Array.prototype.forEach.call(x, function (el) {
            var div = el.id.split('-')
            if (div[1] == htmlid) {
                document.getElementById(el.id).style.display = 'none'
            }
        })
        document.getElementById('tc_no_pay_vid-' + htmlid).style.display =
            'none'
    }

    function tc_get_pay_request(cur, fallback) {
        var skip = 'N'
        var satoshi_amount = document.getElementById(
            'tc_donate_amount_val-' + htmlid
        ).value
        if (satoshi_amount == 0 || satoshi_amount == '') {
            skip = 'Y'
            alert('Please enter an amount.')
        } else {
            satoshi_amount = parseFloat(satoshi_amount)
        }
        if (cur == 'btc' && satoshi_amount < 1000) {
            skip = 'Y'
            alert(
                'Please select Lightning for amounts smaller than 1000 satoshis.'
            )
        }
        if (cur == 'ln' && satoshi_amount > 4200000) {
            skip = 'Y'
            alert('Please select Bitcoin for amounts larger than 0.042 BTC.')
        }
        if (cur == 'ln' && satoshi_amount < 101) {
            skip = 'Y'
            alert('Please choose an amount greater than 100 satoshis.')
        }

        if (skip == 'N') {
            document.getElementById('tc_front-' + htmlid).style.display = 'none'
            document.getElementById('tc_spinner-' + htmlid).style.display =
                'block'

            document.getElementById(
                'tc_sat_pending-' + htmlid
            ).value = satoshi_amount
            document.getElementById('tc_pay_method-' + htmlid).value = cur
            var message = document.getElementById('tc_message-' + htmlid).value
            if (
                document.getElementById('public_chkbox-' + htmlid).checked !==
                true
            ) {
                var l = logged_in_as
            } else {
                var l = ''
            }

            var params =
                'satoshi_amount=' +
                satoshi_amount +
                '&payment_method=' +
                cur +
                '&id=' +
                fundid +
                '&type=fundraiser&message=' +
                encodeURI(message) +
                '&fallback=' +
                fallback +
                '&logged_in_as=' +
                l
            call_api(params, '/v1/payment/request/index.php')
        }
    }

    function tc_pay_page(response) {
        if (response != '') {
            document.getElementById('tc_back-' + htmlid).style.display = 'block'
            document.getElementById('tc_pay_back-' + htmlid).style.display =
                'inline-block'
            document.getElementById('tc_paid_back-' + htmlid).style.display =
                'none'
            document.getElementById('tc_spinner-' + htmlid).style.display =
                'none'
            document.getElementById('tc_pay_page-' + htmlid).style.display =
                'block'
            document.getElementById('tc_qr-' + htmlid).style.display = 'block'
            document.getElementById('tc_ow-' + htmlid).style.display =
                'inline-block'
            document.getElementById('tc_pay_timer-' + htmlid).style.display =
                'inline-block'
            document.getElementById('tc_exact-' + htmlid).style.display =
                'inline-block'
            document.getElementById(
                'tc_paid_button_text-' + htmlid
            ).style.display = 'none'
            document.getElementById('tc_payment_id-' + htmlid).value =
                response.tc_payment_id
            document.getElementById('tc_no_pay_vid-' + htmlid).style.display =
                'none'

            if (response.fallback_avail == 'Y') {
                document.getElementById(
                    'fallback_note-' + htmlid
                ).style.display = 'inherit'
            } else {
                document.getElementById(
                    'fallback_note-' + htmlid
                ).style.display = 'none'
            }

            if (response.message != '') {
                document.getElementById(
                    'prev_message_wr-' + htmlid
                ).style.display = 'block'
                document.getElementById(
                    'prev_message_txt-' + htmlid
                ).innerHTML = response.message
                document
                    .getElementById('prev_message_avatar-' + htmlid)
                    .setAttribute(
                        'style',
                        'background:url("' +
                            response.payer_avatar +
                            '") #ffffff;background-size:contain;'
                    )
            } else {
                document.getElementById(
                    'prev_message_wr-' + htmlid
                ).style.display = 'none'
            }

            if (response.lightning_pay_request !== undefined) {
                var type = 'ln'
                var cost_in_btc = ''
                var qrdata = response.lightning_pay_request
                var wallet_link = 'lightning:' + response.lightning_pay_request
                var exact_send = 'Send ' + response.cost + ' satoshis'
            } else {
                var cost_in_btc = response.cost / 100000000
                var qrdata = response.btc_address
                var type = 'btc'
                var wallet_link =
                    'bitcoin:' + response.btc_address + '?amount=' + cost_in_btc
                var exact_send = 'Send exactly ' + cost_in_btc + ' BTC'
            }

            var qrcode = tc_createQRCode(type, qrdata, cost_in_btc)
            document.getElementById('qr_code_wr-' + htmlid).style.display =
                'block'
            document
                .getElementById('tc_qr-' + htmlid)
                .setAttribute(
                    'style',
                    'background:url("' +
                        qrcode +
                        '") #ffffff;background-size:300px 300px;'
                )
            document.getElementById(
                'tc_open_wallet-' + htmlid
            ).href = wallet_link
            document.getElementById('tc_to_copy-' + htmlid).value = qrdata
            document.getElementById('tc_pay_timer-' + htmlid).innerHTML = '300'
            document.getElementById('tc_exact-' + htmlid).innerHTML = exact_send
            paytimer = setInterval(function () {
                doPayTimer()
            }, 1000)
        }
    }

    function doPayTimer() {
        var paytimeleft = parseInt(
            document.getElementById('tc_pay_timer-' + htmlid).innerHTML
        )
        if (paytimeleft == '1') {
            clearInterval(paytimer)
            document.getElementById('tc_pay_timer-' + htmlid).innerHTML =
                'NO PAYMENT'
            document.getElementById('qr_code_wr-' + htmlid).style.display =
                'none'
            document.getElementById('prev_message_wr-' + htmlid).style.display =
                'none'
            document.getElementById('tc_no_pay_vid-' + htmlid).style.display =
                'block'
            document.getElementById('tc_no_pay_gif-' + htmlid).src =
                'https://tallyco.in/img/unpaid_alert.gif'
        } else {
            document.getElementById('tc_pay_timer-' + htmlid).innerHTML =
                parseInt(paytimeleft) - 1
        }

        if (
            parseInt(paytimeleft) % 5 === 0 &&
            parseInt(paytimeleft) < 294 &&
            paychk == ''
        ) {
            paychk = 'V'
            var tc_payment_id = document.getElementById(
                'tc_payment_id-' + htmlid
            ).value
            call_api(
                'payment_id=' + tc_payment_id,
                '/v1/payment/verify/index.php'
            )
        }
    }

    function verifyPayment(response) {
        paychk = ''
        if (response.payment_state == 'paid') {
            clearInterval(paytimer)
            document.getElementById('qr_code_wr-' + htmlid).style.display =
                'none'
            document.getElementById('prev_message_wr-' + htmlid).style.display =
                'none'
            document.getElementById(
                'tc_paid_button_text-' + htmlid
            ).style.display = 'block'
            document.getElementById('tc_pay_timer-' + htmlid).style.display =
                'none'
            document.getElementById('tc_pay_back-' + htmlid).style.display =
                'none'
            document.getElementById('tc_paid_back-' + htmlid).style.display =
                'inline-block'
            document.getElementById('tc_message-' + htmlid).value = ''
            document.getElementById('tc_donate_amount_val-' + htmlid).value = ''
            document.getElementById('tc_paid_gif-' + htmlid).src =
                'https://tallyco.in/img/paid_tick.gif'

            var arr = []
            arr['satoshi_amount'] = response.satoshi_amount
            arr['payment_method'] = response.payment_method
            arr['paid_timestamp'] = response.paid_timestamp
            arr['message'] = response.message
            payment_success_callback(success_callback, window, arr)

            setTimeout(function () {
                tc_donate_amount('hide')
                tc_pay_back()
            }, 15000)
        }

        if (typeof response.error !== 'undefined') {
            clearInterval(paytimer)
            document.getElementById('tc_back-' + htmlid).style.display = 'none'
            tc_error_page(response.error)
        }
    }

    function tc_createQRCode(type, data, amount) {
        if (type == 'btc') {
            var typeNumber = 6
            if (amount != '') {
                var amount = '?amount=' + amount
            }
            var invoice = 'bitcoin:' + data + amount
        }
        if (type == 'ln') {
            var typeNumber = 20
            var invoice = 'lightning:' + data
        }
        var qr = tc_qrcode(typeNumber, 'M')
        qr.addData(invoice)
        qr.make()
        myqrCode = qr.createImgTag(6, 30)
        return myqrCode
    }
}

function tc_copyToClipboard(htmlid) {
    document.getElementById('tc_copied-' + htmlid).style.display = 'block'
    var tocopy = document.getElementById('tc_to_copy-' + htmlid).value
    var elem = document.createElement('form')
    elem.setAttribute('id', 'tc_copy_form')
    var i = document.createElement('input')
    i.setAttribute('type', 'text')
    i.setAttribute('value', tocopy)
    i.setAttribute('id', 'copy_this_to_clipboard')
    elem.appendChild(i)
    document.getElementById('tc_panel_' + htmlid).appendChild(elem)

    el = document.getElementById('copy_this_to_clipboard')
    if (document.body.createTextRange) {
        var textRange = document.body.createTextRange()
        textRange.moveToElementText(el)
        textRange.select()
        textRange.execCommand('Copy')
    } else if (window.getSelection && document.createRange) {
        var editable = el.contentEditable
        var readOnly = el.readOnly
        el.contentEditable = true
        el.readOnly = false
        var range = document.createRange()
        range.selectNodeContents(el)
        var sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        if (el.nodeName == 'TEXTAREA' || el.nodeName == 'INPUT') el.select()
        if (
            el.setSelectionRange &&
            navigator.userAgent.match(/ipad|ipod|iphone/i)
        )
            el.setSelectionRange(0, 999999)
        el.contentEditable = editable
        el.readOnly = readOnly
        if (document.queryCommandSupported('copy')) {
            document.execCommand('copy')
        } else {
            alert('Sorry. Copy on this device is not supported')
        }
    }

    var element = document.getElementById('tc_copy_form')
    element.parentNode.removeChild(element)
    setTimeout(function () {
        document.getElementById('tc_copied-' + htmlid).style.display = 'none'
    }, 1000)
}

function payment_success_callback(functionName, context, amount_paid) {
    var namespaces = functionName.split('.')
    var func = namespaces.pop()
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]]
    }
    return context[func].apply(context, [amount_paid])
}

// QR Code
var tc_qrcode = (function () {
    var r = function (r, t) {
        var e = r,
            n = f[t],
            o = null,
            i = 0,
            u = null,
            a = [],
            g = {},
            c = function (r, t) {
                ;(o = (function (r) {
                    for (var t = new Array(r), e = 0; e < r; e += 1) {
                        t[e] = new Array(r)
                        for (var n = 0; n < r; n += 1) t[e][n] = null
                    }
                    return t
                })((i = 4 * e + 17))),
                    h(0, 0),
                    h(i - 7, 0),
                    h(0, i - 7),
                    s(),
                    l(),
                    d(r, t),
                    e >= 7 && v(r),
                    null == u && (u = y(e, n, a)),
                    w(u, t)
            },
            h = function (r, t) {
                for (var e = -1; e <= 7; e += 1)
                    if (!(r + e <= -1 || i <= r + e))
                        for (var n = -1; n <= 7; n += 1)
                            t + n <= -1 ||
                                i <= t + n ||
                                (o[r + e][t + n] =
                                    (0 <= e && e <= 6 && (0 == n || 6 == n)) ||
                                    (0 <= n && n <= 6 && (0 == e || 6 == e)) ||
                                    (2 <= e && e <= 4 && 2 <= n && n <= 4))
            },
            l = function () {
                for (var r = 8; r < i - 8; r += 1)
                    null == o[r][6] && (o[r][6] = r % 2 == 0)
                for (var t = 8; t < i - 8; t += 1)
                    null == o[6][t] && (o[6][t] = t % 2 == 0)
            },
            s = function () {
                for (
                    var r = p.getPatternPosition(e), t = 0;
                    t < r.length;
                    t += 1
                )
                    for (var n = 0; n < r.length; n += 1) {
                        var i = r[t],
                            u = r[n]
                        if (null == o[i][u])
                            for (var a = -2; a <= 2; a += 1)
                                for (var f = -2; f <= 2; f += 1)
                                    o[i + a][u + f] =
                                        -2 == a ||
                                        2 == a ||
                                        -2 == f ||
                                        2 == f ||
                                        (0 == a && 0 == f)
                    }
            },
            v = function (r) {
                for (var t = p.getBCHTypeNumber(e), n = 0; n < 18; n += 1) {
                    var u = !r && 1 == ((t >> n) & 1)
                    o[Math.floor(n / 3)][(n % 3) + i - 8 - 3] = u
                }
                for (n = 0; n < 18; n += 1) {
                    u = !r && 1 == ((t >> n) & 1)
                    o[(n % 3) + i - 8 - 3][Math.floor(n / 3)] = u
                }
            },
            d = function (r, t) {
                for (
                    var e = (n << 3) | t, u = p.getBCHTypeInfo(e), a = 0;
                    a < 15;
                    a += 1
                ) {
                    var f = !r && 1 == ((u >> a) & 1)
                    a < 6
                        ? (o[a][8] = f)
                        : a < 8
                        ? (o[a + 1][8] = f)
                        : (o[i - 15 + a][8] = f)
                }
                for (a = 0; a < 15; a += 1) {
                    f = !r && 1 == ((u >> a) & 1)
                    a < 8
                        ? (o[8][i - a - 1] = f)
                        : a < 9
                        ? (o[8][15 - a - 1 + 1] = f)
                        : (o[8][15 - a - 1] = f)
                }
                o[i - 8][8] = !r
            },
            w = function (r, t) {
                for (
                    var e = -1,
                        n = i - 1,
                        u = 7,
                        a = 0,
                        f = p.getMaskFunction(t),
                        g = i - 1;
                    g > 0;
                    g -= 2
                )
                    for (6 == g && (g -= 1); ; ) {
                        for (var c = 0; c < 2; c += 1)
                            if (null == o[n][g - c]) {
                                var h = !1
                                a < r.length && (h = 1 == ((r[a] >>> u) & 1)),
                                    f(n, g - c) && (h = !h),
                                    (o[n][g - c] = h),
                                    -1 == (u -= 1) && ((a += 1), (u = 7))
                            }
                        if ((n += e) < 0 || i <= n) {
                            ;(n -= e), (e = -e)
                            break
                        }
                    }
            },
            y = function (r, t, e) {
                for (
                    var n = k.getRSBlocks(r, t), o = m(), i = 0;
                    i < e.length;
                    i += 1
                ) {
                    var u = e[i]
                    o.put(u.getMode(), 4),
                        o.put(u.getLength(), p.getLengthInBits(u.getMode(), r)),
                        u.write(o)
                }
                var a = 0
                for (i = 0; i < n.length; i += 1) a += n[i].dataCount
                if (o.getLengthInBits() > 8 * a)
                    throw (
                        'code length overflow. (' +
                        o.getLengthInBits() +
                        '>' +
                        8 * a +
                        ')'
                    )
                for (
                    o.getLengthInBits() + 4 <= 8 * a && o.put(0, 4);
                    o.getLengthInBits() % 8 != 0;

                )
                    o.putBit(!1)
                for (
                    ;
                    !(
                        o.getLengthInBits() >= 8 * a ||
                        (o.put(236, 8), o.getLengthInBits() >= 8 * a)
                    );

                )
                    o.put(17, 8)
                return (function (r, t) {
                    for (
                        var e = 0,
                            n = 0,
                            o = 0,
                            i = new Array(t.length),
                            u = new Array(t.length),
                            a = 0;
                        a < t.length;
                        a += 1
                    ) {
                        var f = t[a].dataCount,
                            g = t[a].totalCount - f
                        ;(n = Math.max(n, f)),
                            (o = Math.max(o, g)),
                            (i[a] = new Array(f))
                        for (var c = 0; c < i[a].length; c += 1)
                            i[a][c] = 255 & r.getBuffer()[c + e]
                        e += f
                        var h = p.getErrorCorrectPolynomial(g),
                            l = B(i[a], h.getLength() - 1).mod(h)
                        for (
                            u[a] = new Array(h.getLength() - 1), c = 0;
                            c < u[a].length;
                            c += 1
                        ) {
                            var s = c + l.getLength() - u[a].length
                            u[a][c] = s >= 0 ? l.getAt(s) : 0
                        }
                    }
                    var v = 0
                    for (c = 0; c < t.length; c += 1) v += t[c].totalCount
                    var d = new Array(v),
                        w = 0
                    for (c = 0; c < n; c += 1)
                        for (a = 0; a < t.length; a += 1)
                            c < i[a].length && ((d[w] = i[a][c]), (w += 1))
                    for (c = 0; c < o; c += 1)
                        for (a = 0; a < t.length; a += 1)
                            c < u[a].length && ((d[w] = u[a][c]), (w += 1))
                    return d
                })(o, n)
            }
        return (
            (g.addData = function (r, t) {
                var e = null
                switch ((t = t || 'Byte')) {
                    case 'Numeric':
                        e = b(r)
                        break
                    case 'Alphanumeric':
                        e = L(r)
                        break
                    case 'Byte':
                        e = M(r)
                        break
                    case 'Kanji':
                        e = x(r)
                        break
                    default:
                        throw 'mode:' + t
                }
                a.push(e), (u = null)
            }),
            (g.isDark = function (r, t) {
                if (r < 0 || i <= r || t < 0 || i <= t) throw r + ',' + t
                return o[r][t]
            }),
            (g.getModuleCount = function () {
                return i
            }),
            (g.make = function () {
                if (e < 1) {
                    for (var r = 1; r < 40; r++) {
                        for (
                            var t = k.getRSBlocks(r, n), o = m(), i = 0;
                            i < a.length;
                            i++
                        ) {
                            var u = a[i]
                            o.put(u.getMode(), 4),
                                o.put(
                                    u.getLength(),
                                    p.getLengthInBits(u.getMode(), r)
                                ),
                                u.write(o)
                        }
                        var f = 0
                        for (i = 0; i < t.length; i++) f += t[i].dataCount
                        if (o.getLengthInBits() <= 8 * f) break
                    }
                    e = r
                }
                c(
                    !1,
                    (function () {
                        for (var r = 0, t = 0, e = 0; e < 8; e += 1) {
                            c(!0, e)
                            var n = p.getLostPoint(g)
                            ;(0 == e || r > n) && ((r = n), (t = e))
                        }
                        return t
                    })()
                )
            }),
            (g.createTableTag = function (r, t) {
                r = r || 2
                var e = ''
                ;(e += '<table style="'),
                    (e += ' border-width: 0px; border-style: none;'),
                    (e += ' border-collapse: collapse;'),
                    (e +=
                        ' padding: 0px; margin: ' +
                        (t = void 0 === t ? 4 * r : t) +
                        'px;'),
                    (e += '">'),
                    (e += '<tbody>')
                for (var n = 0; n < g.getModuleCount(); n += 1) {
                    e += '<tr>'
                    for (var o = 0; o < g.getModuleCount(); o += 1)
                        (e += '<td style="'),
                            (e += ' border-width: 0px; border-style: none;'),
                            (e += ' border-collapse: collapse;'),
                            (e += ' padding: 0px; margin: 0px;'),
                            (e += ' width: ' + r + 'px;'),
                            (e += ' height: ' + r + 'px;'),
                            (e += ' background-color: '),
                            (e += g.isDark(n, o) ? '#000000' : '#ffffff'),
                            (e += ';'),
                            (e += '"/>')
                    e += '</tr>'
                }
                return (e += '</tbody>'), (e += '</table>')
            }),
            (g.createSvgTag = function (r, t) {
                ;(r = r || 2), (t = void 0 === t ? 4 * r : t)
                var e,
                    n,
                    o,
                    i,
                    u = g.getModuleCount() * r + 2 * t,
                    a = ''
                for (
                    i = 'l' + r + ',0 0,' + r + ' -' + r + ',0 0,-' + r + 'z ',
                        a +=
                            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',
                        a += ' width="' + u + 'px"',
                        a += ' height="' + u + 'px"',
                        a += ' viewBox="0 0 ' + u + ' ' + u + '" ',
                        a += ' preserveAspectRatio="xMinYMin meet">',
                        a +=
                            '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',
                        a += '<path d="',
                        n = 0;
                    n < g.getModuleCount();
                    n += 1
                )
                    for (o = n * r + t, e = 0; e < g.getModuleCount(); e += 1)
                        g.isDark(n, e) && (a += 'M' + (e * r + t) + ',' + o + i)
                return (
                    (a += '" stroke="transparent" fill="black"/>'),
                    (a += '</svg>')
                )
            }),
            (g.createImgTag = function (r, t) {
                ;(r = r || 2), (t = void 0 === t ? 4 * r : t)
                var e = g.getModuleCount() * r + 2 * t,
                    n = t,
                    o = e - t
                return I(e, e, function (t, e) {
                    if (n <= t && t < o && n <= e && e < o) {
                        var i = Math.floor((t - n) / r),
                            u = Math.floor((e - n) / r)
                        return g.isDark(u, i) ? 0 : 1
                    }
                    return 1
                })
            }),
            (g.renderTo2dContext = function (r, t) {
                t = t || 2
                for (var e = g.getModuleCount(), n = 0; n < e; n++)
                    for (var o = 0; o < e; o++)
                        (r.fillStyle = g.isDark(n, o) ? 'black' : 'white'),
                            r.fillRect(n * t, o * t, t, t)
            }),
            g
        )
    }
    ;(r.stringToBytes = (r.stringToBytesFuncs = {
        default: function (r) {
            for (var t = [], e = 0; e < r.length; e += 1) {
                var n = r.charCodeAt(e)
                t.push(255 & n)
            }
            return t
        },
    }).default),
        (r.createStringToBytes = function (r, t) {
            var e = (function () {
                    for (
                        var e = D(r),
                            n = function () {
                                var r = e.read()
                                if (-1 == r) throw 'eof'
                                return r
                            },
                            o = 0,
                            i = {};
                        ;

                    ) {
                        var u = e.read()
                        if (-1 == u) break
                        var a = n(),
                            f = (n() << 8) | n()
                        ;(i[String.fromCharCode((u << 8) | a)] = f), (o += 1)
                    }
                    if (o != t) throw o + ' != ' + t
                    return i
                })(),
                n = '?'.charCodeAt(0)
            return function (r) {
                for (var t = [], o = 0; o < r.length; o += 1) {
                    var i = r.charCodeAt(o)
                    if (i < 128) t.push(i)
                    else {
                        var u = e[r.charAt(o)]
                        'number' == typeof u
                            ? (255 & u) == u
                                ? t.push(u)
                                : (t.push(u >>> 8), t.push(255 & u))
                            : t.push(n)
                    }
                }
                return t
            }
        })
    var t,
        e,
        n,
        o = 1,
        i = 2,
        u = 4,
        a = 8,
        f = { L: 1, M: 0, Q: 3, H: 2 },
        g = 0,
        c = 1,
        h = 2,
        l = 3,
        s = 4,
        v = 5,
        d = 6,
        w = 7,
        p =
            ((t = [
                [],
                [6, 18],
                [6, 22],
                [6, 26],
                [6, 30],
                [6, 34],
                [6, 22, 38],
                [6, 24, 42],
                [6, 26, 46],
                [6, 28, 50],
                [6, 30, 54],
                [6, 32, 58],
                [6, 34, 62],
                [6, 26, 46, 66],
                [6, 26, 48, 70],
                [6, 26, 50, 74],
                [6, 30, 54, 78],
                [6, 30, 56, 82],
                [6, 30, 58, 86],
                [6, 34, 62, 90],
                [6, 28, 50, 72, 94],
                [6, 26, 50, 74, 98],
                [6, 30, 54, 78, 102],
                [6, 28, 54, 80, 106],
                [6, 32, 58, 84, 110],
                [6, 30, 58, 86, 114],
                [6, 34, 62, 90, 118],
                [6, 26, 50, 74, 98, 122],
                [6, 30, 54, 78, 102, 126],
                [6, 26, 52, 78, 104, 130],
                [6, 30, 56, 82, 108, 134],
                [6, 34, 60, 86, 112, 138],
                [6, 30, 58, 86, 114, 142],
                [6, 34, 62, 90, 118, 146],
                [6, 30, 54, 78, 102, 126, 150],
                [6, 24, 50, 76, 102, 128, 154],
                [6, 28, 54, 80, 106, 132, 158],
                [6, 32, 58, 84, 110, 136, 162],
                [6, 26, 54, 82, 110, 138, 166],
                [6, 30, 58, 86, 114, 142, 170],
            ]),
            (n = function (r) {
                for (var t = 0; 0 != r; ) (t += 1), (r >>>= 1)
                return t
            }),
            ((e = {}).getBCHTypeInfo = function (r) {
                for (var t = r << 10; n(t) - n(1335) >= 0; )
                    t ^= 1335 << (n(t) - n(1335))
                return 21522 ^ ((r << 10) | t)
            }),
            (e.getBCHTypeNumber = function (r) {
                for (var t = r << 12; n(t) - n(7973) >= 0; )
                    t ^= 7973 << (n(t) - n(7973))
                return (r << 12) | t
            }),
            (e.getPatternPosition = function (r) {
                return t[r - 1]
            }),
            (e.getMaskFunction = function (r) {
                switch (r) {
                    case g:
                        return function (r, t) {
                            return (r + t) % 2 == 0
                        }
                    case c:
                        return function (r, t) {
                            return r % 2 == 0
                        }
                    case h:
                        return function (r, t) {
                            return t % 3 == 0
                        }
                    case l:
                        return function (r, t) {
                            return (r + t) % 3 == 0
                        }
                    case s:
                        return function (r, t) {
                            return (
                                (Math.floor(r / 2) + Math.floor(t / 3)) % 2 == 0
                            )
                        }
                    case v:
                        return function (r, t) {
                            return ((r * t) % 2) + ((r * t) % 3) == 0
                        }
                    case d:
                        return function (r, t) {
                            return (((r * t) % 2) + ((r * t) % 3)) % 2 == 0
                        }
                    case w:
                        return function (r, t) {
                            return (((r * t) % 3) + ((r + t) % 2)) % 2 == 0
                        }
                    default:
                        throw 'bad maskPattern:' + r
                }
            }),
            (e.getErrorCorrectPolynomial = function (r) {
                for (var t = B([1], 0), e = 0; e < r; e += 1)
                    t = t.multiply(B([1, y.gexp(e)], 0))
                return t
            }),
            (e.getLengthInBits = function (r, t) {
                if (1 <= t && t < 10)
                    switch (r) {
                        case o:
                            return 10
                        case i:
                            return 9
                        case u:
                        case a:
                            return 8
                        default:
                            throw 'mode:' + r
                    }
                else if (t < 27)
                    switch (r) {
                        case o:
                            return 12
                        case i:
                            return 11
                        case u:
                            return 16
                        case a:
                            return 10
                        default:
                            throw 'mode:' + r
                    }
                else {
                    if (!(t < 41)) throw 'type:' + t
                    switch (r) {
                        case o:
                            return 14
                        case i:
                            return 13
                        case u:
                            return 16
                        case a:
                            return 12
                        default:
                            throw 'mode:' + r
                    }
                }
            }),
            (e.getLostPoint = function (r) {
                for (var t = r.getModuleCount(), e = 0, n = 0; n < t; n += 1)
                    for (var o = 0; o < t; o += 1) {
                        for (
                            var i = 0, u = r.isDark(n, o), a = -1;
                            a <= 1;
                            a += 1
                        )
                            if (!(n + a < 0 || t <= n + a))
                                for (var f = -1; f <= 1; f += 1)
                                    o + f < 0 ||
                                        t <= o + f ||
                                        (0 == a && 0 == f) ||
                                        (u == r.isDark(n + a, o + f) &&
                                            (i += 1))
                        i > 5 && (e += 3 + i - 5)
                    }
                for (n = 0; n < t - 1; n += 1)
                    for (o = 0; o < t - 1; o += 1) {
                        var g = 0
                        r.isDark(n, o) && (g += 1),
                            r.isDark(n + 1, o) && (g += 1),
                            r.isDark(n, o + 1) && (g += 1),
                            r.isDark(n + 1, o + 1) && (g += 1),
                            (0 != g && 4 != g) || (e += 3)
                    }
                for (n = 0; n < t; n += 1)
                    for (o = 0; o < t - 6; o += 1)
                        r.isDark(n, o) &&
                            !r.isDark(n, o + 1) &&
                            r.isDark(n, o + 2) &&
                            r.isDark(n, o + 3) &&
                            r.isDark(n, o + 4) &&
                            !r.isDark(n, o + 5) &&
                            r.isDark(n, o + 6) &&
                            (e += 40)
                for (o = 0; o < t; o += 1)
                    for (n = 0; n < t - 6; n += 1)
                        r.isDark(n, o) &&
                            !r.isDark(n + 1, o) &&
                            r.isDark(n + 2, o) &&
                            r.isDark(n + 3, o) &&
                            r.isDark(n + 4, o) &&
                            !r.isDark(n + 5, o) &&
                            r.isDark(n + 6, o) &&
                            (e += 40)
                var c = 0
                for (o = 0; o < t; o += 1)
                    for (n = 0; n < t; n += 1) r.isDark(n, o) && (c += 1)
                return (e += (Math.abs((100 * c) / t / t - 50) / 5) * 10)
            }),
            e),
        y = (function () {
            for (
                var r = new Array(256), t = new Array(256), e = 0;
                e < 8;
                e += 1
            )
                r[e] = 1 << e
            for (e = 8; e < 256; e += 1)
                r[e] = r[e - 4] ^ r[e - 5] ^ r[e - 6] ^ r[e - 8]
            for (e = 0; e < 255; e += 1) t[r[e]] = e
            var n = {
                glog: function (r) {
                    if (r < 1) throw 'glog(' + r + ')'
                    return t[r]
                },
                gexp: function (t) {
                    for (; t < 0; ) t += 255
                    for (; t >= 256; ) t -= 255
                    return r[t]
                },
            }
            return n
        })()
    function B(r, t) {
        if (void 0 === r.length) throw r.length + '/' + t
        var e = (function () {
                for (var e = 0; e < r.length && 0 == r[e]; ) e += 1
                for (
                    var n = new Array(r.length - e + t), o = 0;
                    o < r.length - e;
                    o += 1
                )
                    n[o] = r[o + e]
                return n
            })(),
            n = {
                getAt: function (r) {
                    return e[r]
                },
                getLength: function () {
                    return e.length
                },
                multiply: function (r) {
                    for (
                        var t = new Array(n.getLength() + r.getLength() - 1),
                            e = 0;
                        e < n.getLength();
                        e += 1
                    )
                        for (var o = 0; o < r.getLength(); o += 1)
                            t[e + o] ^= y.gexp(
                                y.glog(n.getAt(e)) + y.glog(r.getAt(o))
                            )
                    return B(t, 0)
                },
                mod: function (r) {
                    if (n.getLength() - r.getLength() < 0) return n
                    for (
                        var t = y.glog(n.getAt(0)) - y.glog(r.getAt(0)),
                            e = new Array(n.getLength()),
                            o = 0;
                        o < n.getLength();
                        o += 1
                    )
                        e[o] = n.getAt(o)
                    for (o = 0; o < r.getLength(); o += 1)
                        e[o] ^= y.gexp(y.glog(r.getAt(o)) + t)
                    return B(e, 0).mod(r)
                },
            }
        return n
    }
    var C,
        A,
        k =
            ((C = [
                [1, 26, 19],
                [1, 26, 16],
                [1, 26, 13],
                [1, 26, 9],
                [1, 44, 34],
                [1, 44, 28],
                [1, 44, 22],
                [1, 44, 16],
                [1, 70, 55],
                [1, 70, 44],
                [2, 35, 17],
                [2, 35, 13],
                [1, 100, 80],
                [2, 50, 32],
                [2, 50, 24],
                [4, 25, 9],
                [1, 134, 108],
                [2, 67, 43],
                [2, 33, 15, 2, 34, 16],
                [2, 33, 11, 2, 34, 12],
                [2, 86, 68],
                [4, 43, 27],
                [4, 43, 19],
                [4, 43, 15],
                [2, 98, 78],
                [4, 49, 31],
                [2, 32, 14, 4, 33, 15],
                [4, 39, 13, 1, 40, 14],
                [2, 121, 97],
                [2, 60, 38, 2, 61, 39],
                [4, 40, 18, 2, 41, 19],
                [4, 40, 14, 2, 41, 15],
                [2, 146, 116],
                [3, 58, 36, 2, 59, 37],
                [4, 36, 16, 4, 37, 17],
                [4, 36, 12, 4, 37, 13],
                [2, 86, 68, 2, 87, 69],
                [4, 69, 43, 1, 70, 44],
                [6, 43, 19, 2, 44, 20],
                [6, 43, 15, 2, 44, 16],
                [4, 101, 81],
                [1, 80, 50, 4, 81, 51],
                [4, 50, 22, 4, 51, 23],
                [3, 36, 12, 8, 37, 13],
                [2, 116, 92, 2, 117, 93],
                [6, 58, 36, 2, 59, 37],
                [4, 46, 20, 6, 47, 21],
                [7, 42, 14, 4, 43, 15],
                [4, 133, 107],
                [8, 59, 37, 1, 60, 38],
                [8, 44, 20, 4, 45, 21],
                [12, 33, 11, 4, 34, 12],
                [3, 145, 115, 1, 146, 116],
                [4, 64, 40, 5, 65, 41],
                [11, 36, 16, 5, 37, 17],
                [11, 36, 12, 5, 37, 13],
                [5, 109, 87, 1, 110, 88],
                [5, 65, 41, 5, 66, 42],
                [5, 54, 24, 7, 55, 25],
                [11, 36, 12, 7, 37, 13],
                [5, 122, 98, 1, 123, 99],
                [7, 73, 45, 3, 74, 46],
                [15, 43, 19, 2, 44, 20],
                [3, 45, 15, 13, 46, 16],
                [1, 135, 107, 5, 136, 108],
                [10, 74, 46, 1, 75, 47],
                [1, 50, 22, 15, 51, 23],
                [2, 42, 14, 17, 43, 15],
                [5, 150, 120, 1, 151, 121],
                [9, 69, 43, 4, 70, 44],
                [17, 50, 22, 1, 51, 23],
                [2, 42, 14, 19, 43, 15],
                [3, 141, 113, 4, 142, 114],
                [3, 70, 44, 11, 71, 45],
                [17, 47, 21, 4, 48, 22],
                [9, 39, 13, 16, 40, 14],
                [3, 135, 107, 5, 136, 108],
                [3, 67, 41, 13, 68, 42],
                [15, 54, 24, 5, 55, 25],
                [15, 43, 15, 10, 44, 16],
                [4, 144, 116, 4, 145, 117],
                [17, 68, 42],
                [17, 50, 22, 6, 51, 23],
                [19, 46, 16, 6, 47, 17],
                [2, 139, 111, 7, 140, 112],
                [17, 74, 46],
                [7, 54, 24, 16, 55, 25],
                [34, 37, 13],
                [4, 151, 121, 5, 152, 122],
                [4, 75, 47, 14, 76, 48],
                [11, 54, 24, 14, 55, 25],
                [16, 45, 15, 14, 46, 16],
                [6, 147, 117, 4, 148, 118],
                [6, 73, 45, 14, 74, 46],
                [11, 54, 24, 16, 55, 25],
                [30, 46, 16, 2, 47, 17],
                [8, 132, 106, 4, 133, 107],
                [8, 75, 47, 13, 76, 48],
                [7, 54, 24, 22, 55, 25],
                [22, 45, 15, 13, 46, 16],
                [10, 142, 114, 2, 143, 115],
                [19, 74, 46, 4, 75, 47],
                [28, 50, 22, 6, 51, 23],
                [33, 46, 16, 4, 47, 17],
                [8, 152, 122, 4, 153, 123],
                [22, 73, 45, 3, 74, 46],
                [8, 53, 23, 26, 54, 24],
                [12, 45, 15, 28, 46, 16],
                [3, 147, 117, 10, 148, 118],
                [3, 73, 45, 23, 74, 46],
                [4, 54, 24, 31, 55, 25],
                [11, 45, 15, 31, 46, 16],
                [7, 146, 116, 7, 147, 117],
                [21, 73, 45, 7, 74, 46],
                [1, 53, 23, 37, 54, 24],
                [19, 45, 15, 26, 46, 16],
                [5, 145, 115, 10, 146, 116],
                [19, 75, 47, 10, 76, 48],
                [15, 54, 24, 25, 55, 25],
                [23, 45, 15, 25, 46, 16],
                [13, 145, 115, 3, 146, 116],
                [2, 74, 46, 29, 75, 47],
                [42, 54, 24, 1, 55, 25],
                [23, 45, 15, 28, 46, 16],
                [17, 145, 115],
                [10, 74, 46, 23, 75, 47],
                [10, 54, 24, 35, 55, 25],
                [19, 45, 15, 35, 46, 16],
                [17, 145, 115, 1, 146, 116],
                [14, 74, 46, 21, 75, 47],
                [29, 54, 24, 19, 55, 25],
                [11, 45, 15, 46, 46, 16],
                [13, 145, 115, 6, 146, 116],
                [14, 74, 46, 23, 75, 47],
                [44, 54, 24, 7, 55, 25],
                [59, 46, 16, 1, 47, 17],
                [12, 151, 121, 7, 152, 122],
                [12, 75, 47, 26, 76, 48],
                [39, 54, 24, 14, 55, 25],
                [22, 45, 15, 41, 46, 16],
                [6, 151, 121, 14, 152, 122],
                [6, 75, 47, 34, 76, 48],
                [46, 54, 24, 10, 55, 25],
                [2, 45, 15, 64, 46, 16],
                [17, 152, 122, 4, 153, 123],
                [29, 74, 46, 14, 75, 47],
                [49, 54, 24, 10, 55, 25],
                [24, 45, 15, 46, 46, 16],
                [4, 152, 122, 18, 153, 123],
                [13, 74, 46, 32, 75, 47],
                [48, 54, 24, 14, 55, 25],
                [42, 45, 15, 32, 46, 16],
                [20, 147, 117, 4, 148, 118],
                [40, 75, 47, 7, 76, 48],
                [43, 54, 24, 22, 55, 25],
                [10, 45, 15, 67, 46, 16],
                [19, 148, 118, 6, 149, 119],
                [18, 75, 47, 31, 76, 48],
                [34, 54, 24, 34, 55, 25],
                [20, 45, 15, 61, 46, 16],
            ]),
            ((A = {}).getRSBlocks = function (r, t) {
                var e = (function (r, t) {
                    switch (t) {
                        case f.L:
                            return C[4 * (r - 1) + 0]
                        case f.M:
                            return C[4 * (r - 1) + 1]
                        case f.Q:
                            return C[4 * (r - 1) + 2]
                        case f.H:
                            return C[4 * (r - 1) + 3]
                        default:
                            return
                    }
                })(r, t)
                if (void 0 === e)
                    throw (
                        'bad rs block @ typeNumber:' +
                        r +
                        '/errorCorrectionLevel:' +
                        t
                    )
                for (var n, o, i = e.length / 3, u = [], a = 0; a < i; a += 1)
                    for (
                        var g = e[3 * a + 0],
                            c = e[3 * a + 1],
                            h = e[3 * a + 2],
                            l = 0;
                        l < g;
                        l += 1
                    )
                        u.push(
                            ((n = h),
                            (o = void 0),
                            ((o = {}).totalCount = c),
                            (o.dataCount = n),
                            o)
                        )
                return u
            }),
            A),
        m = function () {
            var r = [],
                t = 0,
                e = {
                    getBuffer: function () {
                        return r
                    },
                    getAt: function (t) {
                        var e = Math.floor(t / 8)
                        return 1 == ((r[e] >>> (7 - (t % 8))) & 1)
                    },
                    put: function (r, t) {
                        for (var n = 0; n < t; n += 1)
                            e.putBit(1 == ((r >>> (t - n - 1)) & 1))
                    },
                    getLengthInBits: function () {
                        return t
                    },
                    putBit: function (e) {
                        var n = Math.floor(t / 8)
                        r.length <= n && r.push(0),
                            e && (r[n] |= 128 >>> t % 8),
                            (t += 1)
                    },
                }
            return e
        },
        b = function (r) {
            var t = o,
                e = r,
                n = {
                    getMode: function () {
                        return t
                    },
                    getLength: function (r) {
                        return e.length
                    },
                    write: function (r) {
                        for (var t = e, n = 0; n + 2 < t.length; )
                            r.put(i(t.substring(n, n + 3)), 10), (n += 3)
                        n < t.length &&
                            (t.length - n == 1
                                ? r.put(i(t.substring(n, n + 1)), 4)
                                : t.length - n == 2 &&
                                  r.put(i(t.substring(n, n + 2)), 7))
                    },
                },
                i = function (r) {
                    for (var t = 0, e = 0; e < r.length; e += 1)
                        t = 10 * t + u(r.charAt(e))
                    return t
                },
                u = function (r) {
                    if ('0' <= r && r <= '9')
                        return r.charCodeAt(0) - '0'.charCodeAt(0)
                    throw 'illegal char :' + r
                }
            return n
        },
        L = function (r) {
            var t = i,
                e = r,
                n = {
                    getMode: function () {
                        return t
                    },
                    getLength: function (r) {
                        return e.length
                    },
                    write: function (r) {
                        for (var t = e, n = 0; n + 1 < t.length; )
                            r.put(45 * o(t.charAt(n)) + o(t.charAt(n + 1)), 11),
                                (n += 2)
                        n < t.length && r.put(o(t.charAt(n)), 6)
                    },
                },
                o = function (r) {
                    if ('0' <= r && r <= '9')
                        return r.charCodeAt(0) - '0'.charCodeAt(0)
                    if ('A' <= r && r <= 'Z')
                        return r.charCodeAt(0) - 'A'.charCodeAt(0) + 10
                    switch (r) {
                        case ' ':
                            return 36
                        case '$':
                            return 37
                        case '%':
                            return 38
                        case '*':
                            return 39
                        case '+':
                            return 40
                        case '-':
                            return 41
                        case '.':
                            return 42
                        case '/':
                            return 43
                        case ':':
                            return 44
                        default:
                            throw 'illegal char :' + r
                    }
                }
            return n
        },
        M = function (t) {
            var e = u,
                n = r.stringToBytes(t),
                o = {
                    getMode: function () {
                        return e
                    },
                    getLength: function (r) {
                        return n.length
                    },
                    write: function (r) {
                        for (var t = 0; t < n.length; t += 1) r.put(n[t], 8)
                    },
                }
            return o
        },
        x = function (t) {
            var e = a,
                n = r.stringToBytesFuncs.SJIS
            if (!n) throw 'sjis not supported.'
            !(function (r, t) {
                var e = n('å‹')
                if (2 != e.length || 38726 != ((e[0] << 8) | e[1]))
                    throw 'sjis not supported.'
            })()
            var o = n(t),
                i = {
                    getMode: function () {
                        return e
                    },
                    getLength: function (r) {
                        return ~~(o.length / 2)
                    },
                    write: function (r) {
                        for (var t = o, e = 0; e + 1 < t.length; ) {
                            var n = ((255 & t[e]) << 8) | (255 & t[e + 1])
                            if (33088 <= n && n <= 40956) n -= 33088
                            else {
                                if (!(57408 <= n && n <= 60351))
                                    throw 'illegal char at ' + (e + 1) + '/' + n
                                n -= 49472
                            }
                            ;(n = 192 * ((n >>> 8) & 255) + (255 & n)),
                                r.put(n, 13),
                                (e += 2)
                        }
                        if (e < t.length) throw 'illegal char at ' + (e + 1)
                    },
                }
            return i
        },
        S = function () {
            var r = [],
                t = {
                    writeByte: function (t) {
                        r.push(255 & t)
                    },
                    writeShort: function (r) {
                        t.writeByte(r), t.writeByte(r >>> 8)
                    },
                    writeBytes: function (r, e, n) {
                        ;(e = e || 0), (n = n || r.length)
                        for (var o = 0; o < n; o += 1) t.writeByte(r[o + e])
                    },
                    writeString: function (r) {
                        for (var e = 0; e < r.length; e += 1)
                            t.writeByte(r.charCodeAt(e))
                    },
                    toByteArray: function () {
                        return r
                    },
                    toString: function () {
                        var t = ''
                        t += '['
                        for (var e = 0; e < r.length; e += 1)
                            e > 0 && (t += ','), (t += r[e])
                        return (t += ']')
                    },
                }
            return t
        },
        D = function (r) {
            var t = r,
                e = 0,
                n = 0,
                o = 0,
                i = {
                    read: function () {
                        for (; o < 8; ) {
                            if (e >= t.length) {
                                if (0 == o) return -1
                                throw 'unexpected end of file./' + o
                            }
                            var r = t.charAt(e)
                            if (((e += 1), '=' == r)) return (o = 0), -1
                            r.match(/^\s$/) ||
                                ((n = (n << 6) | u(r.charCodeAt(0))), (o += 6))
                        }
                        var i = (n >>> (o - 8)) & 255
                        return (o -= 8), i
                    },
                },
                u = function (r) {
                    if (65 <= r && r <= 90) return r - 65
                    if (97 <= r && r <= 122) return r - 97 + 26
                    if (48 <= r && r <= 57) return r - 48 + 52
                    if (43 == r) return 62
                    if (47 == r) return 63
                    throw 'c:' + r
                }
            return i
        },
        I = function (r, t, e, n) {
            for (
                var o,
                    i,
                    u,
                    a,
                    f,
                    g,
                    c,
                    h,
                    l =
                        ((u = o = r),
                        (a = i = t),
                        (f = new Array(o * i)),
                        (g = {
                            setPixel: function (r, t, e) {
                                f[t * u + r] = e
                            },
                            write: function (r) {
                                r.writeString('GIF87a'),
                                    r.writeShort(u),
                                    r.writeShort(a),
                                    r.writeByte(128),
                                    r.writeByte(0),
                                    r.writeByte(0),
                                    r.writeByte(0),
                                    r.writeByte(0),
                                    r.writeByte(0),
                                    r.writeByte(255),
                                    r.writeByte(255),
                                    r.writeByte(255),
                                    r.writeString(','),
                                    r.writeShort(0),
                                    r.writeShort(0),
                                    r.writeShort(u),
                                    r.writeShort(a),
                                    r.writeByte(0)
                                var t = c(2)
                                r.writeByte(2)
                                for (var e = 0; t.length - e > 255; )
                                    r.writeByte(255),
                                        r.writeBytes(t, e, 255),
                                        (e += 255)
                                r.writeByte(t.length - e),
                                    r.writeBytes(t, e, t.length - e),
                                    r.writeByte(0),
                                    r.writeString(';')
                            },
                        }),
                        (c = function (r) {
                            for (
                                var t = 1 << r,
                                    e = 1 + (1 << r),
                                    n = r + 1,
                                    o = h(),
                                    i = 0;
                                i < t;
                                i += 1
                            )
                                o.add(String.fromCharCode(i))
                            o.add(String.fromCharCode(t)),
                                o.add(String.fromCharCode(e))
                            var u,
                                a,
                                g,
                                c = S(),
                                l =
                                    ((u = c),
                                    (a = 0),
                                    (g = 0),
                                    {
                                        write: function (r, t) {
                                            if (r >>> t != 0)
                                                throw 'length over'
                                            for (; a + t >= 8; )
                                                u.writeByte(
                                                    255 & ((r << a) | g)
                                                ),
                                                    (t -= 8 - a),
                                                    (r >>>= 8 - a),
                                                    (g = 0),
                                                    (a = 0)
                                            ;(g |= r << a), (a += t)
                                        },
                                        flush: function () {
                                            a > 0 && u.writeByte(g)
                                        },
                                    })
                            l.write(t, n)
                            var s = 0,
                                v = String.fromCharCode(f[s])
                            for (s += 1; s < f.length; ) {
                                var d = String.fromCharCode(f[s])
                                ;(s += 1),
                                    o.contains(v + d)
                                        ? (v += d)
                                        : (l.write(o.indexOf(v), n),
                                          o.size() < 4095 &&
                                              (o.size() == 1 << n && (n += 1),
                                              o.add(v + d)),
                                          (v = d))
                            }
                            return (
                                l.write(o.indexOf(v), n),
                                l.write(e, n),
                                l.flush(),
                                c.toByteArray()
                            )
                        }),
                        (h = function () {
                            var r = {},
                                t = 0,
                                e = {
                                    add: function (n) {
                                        if (e.contains(n)) throw 'dup key:' + n
                                        ;(r[n] = t), (t += 1)
                                    },
                                    size: function () {
                                        return t
                                    },
                                    indexOf: function (t) {
                                        return r[t]
                                    },
                                    contains: function (t) {
                                        return void 0 !== r[t]
                                    },
                                }
                            return e
                        }),
                        g),
                    s = 0;
                s < t;
                s += 1
            )
                for (var v = 0; v < r; v += 1) l.setPixel(v, s, e(v, s))
            var d = S()
            l.write(d)
            for (
                var w,
                    p,
                    y,
                    B,
                    C,
                    A,
                    k,
                    m =
                        ((w = 0),
                        (p = 0),
                        (y = 0),
                        (B = ''),
                        (A = function (r) {
                            B += String.fromCharCode(k(63 & r))
                        }),
                        (k = function (r) {
                            if (r < 0);
                            else {
                                if (r < 26) return 65 + r
                                if (r < 52) return r - 26 + 97
                                if (r < 62) return r - 52 + 48
                                if (62 == r) return 43
                                if (63 == r) return 47
                            }
                            throw 'n:' + r
                        }),
                        ((C = {}).writeByte = function (r) {
                            for (
                                w = (w << 8) | (255 & r), p += 8, y += 1;
                                p >= 6;

                            )
                                A(w >>> (p - 6)), (p -= 6)
                        }),
                        (C.flush = function () {
                            if (
                                (p > 0 && (A(w << (6 - p)), (w = 0), (p = 0)),
                                y % 3 != 0)
                            )
                                for (var r = 3 - (y % 3), t = 0; t < r; t += 1)
                                    B += '='
                        }),
                        (C.toString = function () {
                            return B
                        }),
                        C),
                    b = d.toByteArray(),
                    L = 0;
                L < b.length;
                L += 1
            )
                m.writeByte(b[L])
            m.flush()
            return (
                '<img',
                ' src="',
                'data:image/gif;base64,',
                m,
                '"',
                ' width="',
                r,
                '"',
                ' height="',
                t,
                '"',
                n && (' alt="', n, '"'),
                '/>',
                'data:image/gif;base64,' + m
            )
        }
    return r
})()
;(tc_qrcode.stringToBytesFuncs['UTF-8'] = function (r) {
    return (function (r) {
        for (var t = [], e = 0; e < r.length; e++) {
            var n = r.charCodeAt(e)
            n < 128
                ? t.push(n)
                : n < 2048
                ? t.push(192 | (n >> 6), 128 | (63 & n))
                : n < 55296 || n >= 57344
                ? t.push(224 | (n >> 12), 128 | ((n >> 6) & 63), 128 | (63 & n))
                : (e++,
                  (n = 65536 + (((1023 & n) << 10) | (1023 & r.charCodeAt(e)))),
                  t.push(
                      240 | (n >> 18),
                      128 | ((n >> 12) & 63),
                      128 | ((n >> 6) & 63),
                      128 | (63 & n)
                  ))
        }
        return t
    })(r)
}),
    (function (r) {
        'function' == typeof define && define.amd
            ? define([], r)
            : 'object' == typeof exports && (module.exports = r())
    })(function () {
        return qrcode
    })
