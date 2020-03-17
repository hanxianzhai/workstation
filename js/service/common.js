let url_prefix = "http://localhost:5000";

function init_axios() {
    if (axios) {
        axios.defaults.baseURL = url_prefix;
        axios.defaults.crossDomain = true;
    }
}

async function do_execute_sql(request_data) {
    try {
        component.$Loading.start();
        const res_data = await axios.post("/data", request_data);
        component.$Loading.finish();
        return res_data;
    } catch (e) {
        component.$Loading.error();
        throw e;
    }

}

init_axios();
String.prototype.format = function () {
    if (arguments.length == 0) return this;
    const obj = arguments[0];
    let s = this;
    for (const key in obj) {
        s = s.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), obj[key]);
    }
    return s;
};