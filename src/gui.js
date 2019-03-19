
function get_server(){
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider('https://api.trongrid.io');
    const solidityNode = new HttpProvider('https://api.trongrid.io');
    const eventServer = 'https://api.trongrid.io/';
    const tronWeb = new TronWeb(
        fullNode,
        solidityNode,
        eventServer
    );
    return tronWeb;
}

function get_ascii_addr(pk){
    const tron = get_server();
    if (tron)
        return tron.address.fromPrivateKey(pk);
    return;
}

function convert_ascii(str){
    const tron = get_server();
    if (tron)
        return tron.toHex(str);
    return;
}

function get_acc(addr) {
    if (check_pk(addr)) {
        var user_addr = get_ascii_addr(addr);
        if (user_addr){
            var acc_tokens = get_acc_info(user_addr);
        } else {
            document.getElementById("out_txt").value += "\nInvalid Address";
        }
    } else {
        clear_all()
    }
}

function check_pk(addr) {
    var p_key = addr;
    if (p_key) {
        if (is_ascii(p_key) && p_key.length === 64) {
            document.getElementById("out_txt").value = "\nPrivate Key: " + p_key + "\n\n";
            return true;
        } else {
            document.getElementById("out_txt").value = "\nInvalid Private Key";
        }
    } else {
        document.getElementById("out_txt").value = "\n";
    }
    return false
}

function is_ascii(str) {
    return /^[0-9a-zA-Z]+$/.test(str);
}

function pop_token(t_name){
    var x = document.getElementById("drop_tkn");
    var option = document.createElement("option");
    option.text = t_name;
    x.add(option);
}

async function get_token_name(tron,tid){
    var t_info = await tron.trx.getTokenByID(tid);
    const t_name = JSON.parse(JSON.stringify(t_info, null, 2));
    // console.log([t_name,t_name.name]);
    return t_name.name;
}

async function get_acc_info(acc){
    document.getElementById("out_txt").value += "Address: " + acc + "\n\n";
    let tron = await get_server();
    const hex_addr = tron.address.toHex(acc);
    let accountInfo = await tron.trx.getAccount(hex_addr);
    const data_parse = JSON.parse(JSON.stringify(accountInfo, null, 2));
    const av = data_parse.assetV2;
    if (av.length > 0){
        document.getElementById("out_txt").value += "Available Tokens:\n";
        var out_str = "";
        var id_list = []
        for (var key in av) {
            if (av.hasOwnProperty(key)) {
                var temp = av[key];
                let n = await get_token_name(tron,temp.key);
                pop_token(n);
                out_str += n + "   " + temp.value + "\n";
            }
        }
        if (out_str != "")
            document.getElementById("out_txt").value += out_str;
            document.getElementById("drop_tkn").disabled = false;
            document.getElementById("drop_recs").disabled = false;
    } else {
        document.getElementById("out_txt").value += "No Tokens Available\n";
    }
}

function rec_change(choice) {
    document.getElementById("tkn_addr").disabled = true;
    document.getElementById("sr_addr").disabled = true;
    document.getElementById("tkn_addr").value = "";
    document.getElementById("sr_addr").value = "";
    if (choice == "1") {
        document.getElementById("tkn_addr").disabled = false;
    } else if (choice == "2") {
        document.getElementById("sr_addr").disabled = false;
    } else if (choice == "3") {
        document.getElementById("tkn_addr").disabled = false;
        document.getElementById("sr_addr").disabled = false;
    }
}

function verify_addr(addr){
    if (is_ascii(addr) && addr.length == 34) {
        return true;
    }
    return false;
}

function check_input(val) {
    var tkn_choice = document.getElementById("drop_tkn").value;
    var valid_choice = false;
    if (tkn_choice != "0") {
        valid_choice = true;
    }
    var valid_tkn = true;
    var valid_sr = true;
    var rec_choice = document.getElementById("drop_recs").value;
    if (rec_choice == "3") {
        valid_tkn = false;
        valid_sr = false;
        if (verify_addr(document.getElementById("tkn_addr").value)) {
            valid_tkn = true;
        }
        if (verify_addr(document.getElementById("sr_addr").value)) {
            valid_sr = true;
        }
    } else if (rec_choice == "2") {
        valid_sr = false;
        if (is_ascii(val) && val.length == 34) {
            valid_sr = true;
        }
    } else if (rec_choice == "1") {
        valid_tkn = false;
        if (is_ascii(val) && val.length == 34) {
            valid_tkn = true;
        }
    }

    console.log(valid_choice)
    console.log(valid_tkn)
    console.log(valid_sr)

    if (valid_choice && valid_tkn && valid_sr) {
        document.getElementById("check_btn").disabled = false;
    }
}

function run_check() {
    var tkn_options = document.getElementById("drop_tkn");
    var tkn_idx = tkn_options.selectedIndex;
    var tkn_choice = tkn_options.options[tkn_idx].text;

    var drop_rec = document.getElementById("drop_recs").value;
    if (drop_rec == "1") {
        var drop_txt = "token holders";
    } else if (drop_rec == "2") {
        var drop_txt = "SR voters";
    } else if (drop_rec == "3") {
        var drop_txt = "token holders and SR voters";
    }
    check_str = "You want to drop " + tkn_choice + " to " + drop_txt;
    var ta = document.getElementById("tkn_addr").value;
    var sa = document.getElementById("sr_addr").value;
    if (ta.length > 0) {
        check_str += "\nHolder Address: " + ta;
    }
    if (sa.length > 0) {
        check_str += "\nSR Address: " + sa;
    }
    check_str += "\nIs this correct?"
    var conf = confirm(check_str);
    if (conf) {
        document.getElementById("drop_btn").disabled = false;
    } else {
        clear_all();
        clear_text_box();
        clear_pk();
    }
}

function confirm_drop() {
    alert("Success!")
}

function clear_pk() {
    document.getElementById("pk").value = "";
}

function clear_text_box() {
    document.getElementById("out_txt").value = "\n";
}

function clear_drop1() {
    var i;
    var opt_box = document.getElementById("drop_tkn");
    for(i = opt_box.options.length-1; i > 0; i--) {
        opt_box.remove(i);
    }
    document.getElementById("drop_tkn").disabled = true;
}

function clear_drop2() {
    document.getElementById("drop_recs").disabled = true;
    document.getElementById("drop_recs").value = "0";
}

function clear_addrs() {
    document.getElementById("tkn_addr").value = "";
    document.getElementById("tkn_addr").disabled = true;
    document.getElementById("sr_addr").value = "";
    document.getElementById("sr_addr").disabled = true;
}

function disable_btns(){
    document.getElementById("check_btn").disabled = true;
    document.getElementById("drop_btn").disabled = true;
}

function clear_all() {
    // clear_text_box();
    clear_drop1();
    clear_drop2();
    clear_addrs()
    disable_btns();
}
