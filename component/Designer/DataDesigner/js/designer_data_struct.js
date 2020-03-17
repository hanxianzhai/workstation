function editable_table_common_column(title, key) {
    return {
        title: title,
        key: key,
        sortable: true,
        resizable: true,
        align: 'center',
        titleHtml: ' <i class="ivu-icon ivu-icon-edit"></i>',
        editable: true,
        render: function (h, params) {
            // is in edit status
            if (vue_data.data_struct.is_in_opt && vue_data.data_struct.opt_line == params.index) {
                let edit_value = "";
                if ("insert" == vue_data.data_struct.opt_name) {
                } else if ("update" == vue_data.data_struct.opt_name) {
                    edit_value = vue_data.data_struct.data[params.index][params.column.key];
                }
                return h('Input', {
                    props: {
                        type: 'text',
                        value: edit_value
                    },
                    on: {
                        'on-change'(event) {
                            vue_data.data_struct.data[params.index][params.column.key] = event.target.value;
                        }
                    }
                })
            }
            return h('div', {
                domProps: {
                    innerHTML: vue_data.data_struct.data[params.index][params.column.key],
                },
            })
        }
    }
}

function editable_table_common_operation_column() {
    return {
        title: 'operation',
        width: 250,
        align: 'center',
        render: (h, params) => {
            const div_data = [];
            if (vue_data.data_struct.is_in_opt && vue_data.data_struct.opt_line == params.index) {
                div_data.push(h('Button', {
                    props: {
                        type: 'primary',
                        size: 'small'
                    },
                    style: {
                        marginRight: '15px',
                    },
                    on: {
                        click: () => {
                            const cur_line_index = params.index;
                            const cur_line_data = vue_data.data_struct.data[cur_line_index];
                            cancel_opt_data(cur_line_data);
                        }
                    }
                }, 'cancel'));
                div_data.push(h('Button', {
                    props: {
                        type: 'error',
                        size: 'small'
                    },
                    style: {
                        marginRight: '15px',
                    },
                    on: {
                        click: () => {
                            const cur_line_index = params.index;
                            const cur_line_data = vue_data.data_struct.data[cur_line_index];
                            cur_line_data['id'] = vue_data.data_directory.cur_selected.id;
                            insert_designer_data_struct(cur_line_data)
                        }
                    }
                }, 'save'));
            }
            let is_display_edit = true;
            if (vue_data.data_struct.is_in_opt && vue_data.data_struct.opt_line == params.index && ("update" == vue_data.data_struct.opt_name || "insert" == vue_data.data_struct.opt_name)) {
                is_display_edit = false;
            }
            if (is_display_edit) {
                div_data.push(h('Button', {
                    props: {
                        type: 'error',
                        size: 'small'
                    },
                    style: {
                        marginRight: '15px',
                    },
                    on: {
                        click: () => {
                            const cur_line_index = params.index;
                            vue_data.data_struct.is_in_opt = true;
                            vue_data.data_struct.opt_name = "update";
                            vue_data.data_struct.opt_line = cur_line_index;
                            const cur_line_data = vue_data.data_struct.data[cur_line_index];
                            vue_data.data_struct.data[cur_line_index] = cur_line_data;
                            vue_data.data_struct.data_line_backup = JSON.parse(JSON.stringify(cur_line_data));
                        }
                    }
                }, 'edit'));
            }
            if (is_display_edit) {
                div_data.push(h('Button', {
                    props: {
                        type: 'error',
                        size: 'small'
                    },
                    style: {
                        marginRight: '15px',
                    },
                    on: {
                        click: () => {
                            component.$Modal.warning({
                                title: "温馨提示",
                                content: "删除操作不可逆, 确定删除?",
                                okText: "确定",
                                onOk: function () {
                                    const cur_line_index = params.index;
                                    vue_data.data_struct.is_in_opt = true;
                                    vue_data.data_struct.opt_name = "delete";
                                    vue_data.data_struct.opt_line = cur_line_index;
                                    const cur_line_data = vue_data.data_struct.data[cur_line_index];
                                    opt_data(cur_line_data);
                                },
                                closable: true,
                                onCancel: function () {

                                },
                                cancelText: ""
                            });

                        }
                    }
                }, 'delete'));
            }
            return h('div', div_data);
        }
    };
}

vue_data.data_struct = {
    show: false,
    columns: [
        editable_table_common_column("code", "code"),
        editable_table_common_column("meaning", "meaning"),
        editable_table_common_operation_column(),
    ],
    data: [],
    data_line_backup: {},
    loading: false,
    is_in_opt: false,
    opt_name: "",
    opt_line: -1,
};
vue_methods.data_struct = {
    do_query_designer_data_struct: function () {
        query_designer_data_struct();
    },
    do_insert_designer_data_struct: function () {
        trigger_insert_designer_data_struct();
    }
};


async function trigger_insert_designer_data_struct() {
    // data struct must on one data directory
    if (!vue_data.data_directory.cur_selected.id || vue_data.data_directory.cur_selected.id == "") {
        component.$Message.error("this operation must after the valid data directory selected");
        return;
    }
    // can not continuous multiple times add/update
    if (vue_data.data_struct.is_in_opt) {
        component.$Message.error("can not continuous multiple times add/update");
        return;
    }
    vue_data.data_struct.is_in_opt = true;
    vue_data.data_struct.opt_name = "insert";

    // construct column
    const temp_data_one = {};
    for (const item of vue_data.data_struct.columns) {
        const key = item["key"];
        if (key && key != "") {
            temp_data_one[key] = "";
        }
    }
    vue_data.data_struct.opt_line = vue_data.data_struct.data.length;
    vue_data.data_struct.data.push(temp_data_one);
}

async function cancel_opt_data() {
    const opt_name = vue_data.data_struct.opt_name;
    if ("insert" == opt_name) {
        vue_data.data_struct.data.pop();
    } else if ("update" == opt_name) {
        // 还原
        vue_data.data_struct.is_in_opt = false;
        vue_data.data_struct.opt_name = "";
        const cur_line = vue_data.data_struct.opt_line;
        vue_data.data_struct.opt_line = -1;
        vue_data.data_struct.data[cur_line] = vue_data.data_struct.data_line_backup;
    }
    vue_data.data_struct.is_in_opt = false;
    vue_data.data_struct.opt_name = "";
    vue_data.data_struct.opt_line = -1;
}

async function query_designer_data_struct() {
    try {
        cancel_opt_data();
        // prepare data struct data
        const data_struct = {"id": vue_data.data_directory.cur_selected.id};
        // query data_struct from distribution
        const net_request_result = await do_execute_sql({
            "execute": `
                select code, meaning from designer_data_struct where id = {{id}}
                `.format(data_struct),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        vue_data.data_struct.data = net_request_result.data;
        // adapter list to tree
        component.$Message.success('query success');
    } catch (e) {
        console.log(e);
        component.$Message.error(e.response.data);
    }
}

async function insert_designer_data_struct(data_struct) {
    try {
        // query data_struct from distribution
        const net_request_result = await do_execute_sql({
            "execute": `
                insert into designer_data_struct(id, code, meaning) values ({{id}},'{{code}}','{{meaning}}')
                `.format(data_struct),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        vue_data.data_struct.data = net_request_result.data;
        // adapter list to tree
        component.$Message.success('query success');
        query_designer_data_struct();
    } catch (e) {
        console.log(e);
        component.$Message.error(e.response.data);
    }
}



