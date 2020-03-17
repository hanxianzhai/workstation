let url_prefix = "http://localhost:5000";

function init_axios() {
    if (axios) {
        axios.defaults.baseURL = url_prefix;
        axios.defaults.crossDomain = true;
    }
}
async function do_graphql(request_data){
    try {
        component.$Loading.start();
        const res_data = await axios.post("/data", request_data);
        component.$Loading.finish();
        return res_data;
    } catch (e) {
        component.$Loading.error();
        e.print();
        throw e;
    }

}

init_axios();