vue_data.data_directory = {
    tree: [],
    cur_selected: {
        name: "",
        id: "",
    },
};

async function init_designer_data_directory() {
    try {
        // query data_directory from distribution
        const net_request_result = await do_execute_sql({
            "execute": `
                select id,pid,name,description from designer_data_directories
                `,
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        let original_tree_list = net_request_result.data;
        // adapter list to tree
        const name_str = "title";
        const children_str = "children";

        function setup_tree(pid) {
            const cur_tree_level = [];
            let i = original_tree_list.length;
            while (i--) {
                const originalTreeListElement = original_tree_list[i];
                if (originalTreeListElement["pid"] == pid) {
                    original_tree_list.splice(i, 1);
                    const next_tree_level = setup_tree(originalTreeListElement["id"]);
                    const cur_tree_data = originalTreeListElement;
                    cur_tree_data[name_str] = originalTreeListElement["name"];
                    cur_tree_data["spread"] = true;
                    if (next_tree_level.length > 0) {
                        cur_tree_data[children_str] = next_tree_level;
                    }
                    cur_tree_level.push(cur_tree_data);
                }
            }
            return cur_tree_level;
        }

        const tree_data = setup_tree(null);
        vue_data.data_directory.tree = [{"title": "home", "children": tree_data, "spread": true, "id": null}];
        init_tree_view();
        component.$Message.success('query success');
    } catch (e) {
        console.log(e);
        component.$Message.error(e.response.data);
    }
}

function init_tree_view() {
    layui.use(['tree', 'util'], function () {
        const tree = layui.tree;
        tree.render({
            elem: '#designer_metadata_tree'
            , data: vue_data.data_directory.tree
            , edit: ['add', 'update', 'del']
            , click: function (obj) {
                vue_data.data_directory.cur_selected.name = obj.data.title;
                vue_data.data_directory.cur_selected.id = obj.data.id;
                if (!obj.data.id) {
                    return;
                }
                vue_data.data_struct.show = true;
                vue_methods.data_struct.do_query_designer_data_struct();
            }
            , operate: function (obj) {
                const type = obj.type;
                if (type === 'add') {
                    add_data_directory(obj)
                } else if (type === 'update') {
                    update_data_directory(obj)
                } else if (type === 'del') {
                    delete_data_directory(obj)
                }
            }
        });
    });
}

async function add_data_directory(obj) {
    try {
        // prepare data directory data
        const data_directory = {"pid": obj.data.id, name: ""};
        // save to distribution
        let net_request_result = await do_execute_sql({
            "execute": `
                insert into designer_data_directories(pid,name) values ({{pid}},'{{name}}')
                `.format(data_directory),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        // create a data table
        const db_data = {
            "id": net_request_result.data
        };
        net_request_result = await do_execute_sql({
            "execute": `
                CREATE TABLE designer_data_data_{{id}} (
                    id int(11) NOT NULL AUTO_INCREMENT,
                    PRIMARY KEY (id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                `.format(db_data),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        component.$Message.success('add success');
        await init_designer_data_directory();
    } catch (e) {
        debugger
        console.log(e);
        component.$Message.error(e.response.data);
    }
}

async function update_data_directory(obj) {
    try {
        // prepare data directory data
        const data_directory = {
            "id": obj.data.id,
            "name": obj.data.title,
        };
        // save to distribution
        const net_request_result = await do_execute_sql({
            "execute": `
                update designer_data_directories set name = '{{name}}' where id = {{id}}
                `.format(data_directory),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        component.$Message.success('update success');
        await init_designer_data_directory();
    } catch (e) {
        console.log(e);
        component.$Message.error(e.response.data);
    }
}

async function delete_data_directory(obj) {
    try {
        // prepare data directory data
        const data_directory = {
            "id": obj.data.id,
        };
        if (obj.data.children) {
            component.$Message.error("this data directory has children");
            await init_designer_data_directory();
            return;
        }
        // save to distribution
        let net_request_result = await do_execute_sql({
            "execute": `
                delete from designer_data_directories where id = {{id}}
                `.format(data_directory),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        // drop a data table
        const db_data = {
            "id": obj.data.id
        };
        net_request_result = await do_execute_sql({
            "execute": `
                drop table designer_data_data_{{id}}
                `.format(db_data),
        });
        if (!net_request_result || !net_request_result.status || net_request_result.status != 200 || !net_request_result.data) return;
        component.$Message.success('delete success');
        // close the data struct
        vue_data.data_struct.show = false;
        await init_designer_data_directory();
    } catch (e) {
        debugger
        console.log(e);
        component.$Message.error(e.response.data);
    }
}