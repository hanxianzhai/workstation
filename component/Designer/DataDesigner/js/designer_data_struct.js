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
                            cur_line_data['did'] = vue_data.data_directory.cur_selected.id;
                            opt_data(cur_line_data);
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
                            cur_line_data['did'] = vue_data.data_directory.cur_selected.id;
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
                                    cur_line_data['did'] = vue_data.data_directory.cur_selected.id;
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

async function opt_data(cur_line_data) {
    // operation type
    const opt_name = vue_data.data_struct.opt_name;
    let request_data = {};
    if ("insert" == opt_name) {
        insert_designer_data_struct(cur_line_data);
    } else if ("update" == opt_name) {
        update_designer_data_struct(cur_line_data);
    } else if ("delete" == opt_name) {
        delete_designer_data_struct(cur_line_data);
    }
}

async function query_designer_data_struct() {
    try {
        cancel_opt_data();
        // prepare data struct data
        const data_struct = {"did": vue_data.data_directory.cur_selected.id};
        // query data_struct from distribution
        const net_request_result = await do_execute_sql({
            "execute": `
                select id, code, meaning from designer_data_struct where did = {{did}}
                `.format(data_struct),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        vue_data.data_struct.data = net_request_result.data;
        component.$Message.success('query success');
    } catch (e) {
        console.log(e);
        component.$Message.error(e.response.data);
    }
}

async function insert_designer_data_struct(data_struct) {
    try {
        let net_request_result = null;

        // alter data table add column
        const db_data = {
            "did": data_struct["did"],
            "column": data_struct["code"],
            "comment": data_struct["meaning"],
        };
        net_request_result = await do_execute_sql({
            "execute": `
                ALTER TABLE designer_data_data_{{did}} ADD COLUMN {{column}} VARCHAR(255) DEFAULT NULL COMMENT '{{comment}}';
                `.format(db_data),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;

        // query data_struct from distribution
        net_request_result = await do_execute_sql({
            "execute": `
                insert into designer_data_struct(did, code, meaning) values ({{did}},'{{code}}','{{meaning}}')
                `.format(data_struct),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;

        component.$Message.success('insert success');
        query_designer_data_struct();
    } catch (e) {
        console.log(e.response.data);
        component.$Message.error(e.response.data);
    }
}

async function update_designer_data_struct(data_struct) {
    try {
        let net_request_result = null;

        // alter data table change column
        const db_data = {
            "did": data_struct["did"],
            "column_old": vue_data.data_struct.data_line_backup["code"],
            "column": data_struct["code"],
            "comment": data_struct["meaning"],
        };
        net_request_result = await do_execute_sql({
            "execute": `
                ALTER TABLE designer_data_data_{{did}} change {{column_old}} {{column}} VARCHAR(255) DEFAULT NULL COMMENT '{{comment}}';
                `.format(db_data),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;

        // query data_struct from distribution
        net_request_result = await do_execute_sql({
            "execute": `
                update designer_data_struct set code = '{{code}}',meaning = '{{meaning}}' where id = {{id}}
                `.format(data_struct),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        console.log(vue_data.data_struct.data_line_backup);

        component.$Message.success('update success');
        query_designer_data_struct();
    } catch (e) {
        console.log(e.response.data);
        component.$Message.error(e.response.data);
    }
}

async function delete_designer_data_struct(data_struct) {
    try {
        let net_request_result = null;

        // alter data table delete column
        const db_data = {
            "did": data_struct["did"],
            "column": data_struct["code"],
        };
        net_request_result = await do_execute_sql({
            "execute": `
                ALTER TABLE designer_data_data_{{did}} drop {{column}};
                `.format(db_data),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;

        // query data_struct from distribution
        net_request_result = await do_execute_sql({
            "execute": `
                delete from designer_data_struct where id = {{id}}
                `.format(data_struct),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;

        component.$Message.success('delete success');
        query_designer_data_struct();
    } catch (e) {
        console.log(e.response.data);
        component.$Message.error(e.response.data);
    }
}

