let url_prefix = "http://" + window.location.host;
const DINGDING_LOGIN_CODE_STR = "dingding_login_code";
let last_auth_fail_timestamp = null;

function init_axios() {
    if (axios) {
        axios.defaults.withCredentials = true;
        axios.defaults.crossDomain = true;
        axios.defaults.headers['Access-Control-Allow-Origin'] = '*';
        axios.defaults.headers.common['token'] = localStorage.getItem(DINGDING_LOGIN_CODE_STR);
        axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            const cur_timestamp = new Date().valueOf();
            if (last_auth_fail_timestamp && cur_timestamp - last_auth_fail_timestamp < 1000 * 5) {
                return;
            }
            const response = error["response"];
            if (!response) return;
            const status = response["status"];
            if (401 == status) {
                component.$Message.error({
                    content: error.response.data,
                    duration: 5
                });
                last_auth_fail_timestamp = cur_timestamp;
            }
            return Promise.reject(error);
        });

    }
}

init_axios();