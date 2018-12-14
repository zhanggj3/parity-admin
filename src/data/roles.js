import React from 'react';
export const columns = [
    {
        title: '角色名称',
        dataIndex: 'address',
        key: 'address',
        align:'center',
    }, 
    {
        title: '权限管理概述',
        dataIndex: 'percent',
        key: 'percent',
        align:'center',
    }, 
    {
        title: '权限拥有账号',
        dataIndex: 'status',
        key: 'status',
        align:'center',
    },
    {
        title: '类型',
        dataIndex: 'key',
        key: 'key',
        align:'center',
    },
    {
        title: '操作',
        key: 'action',
        align:'center',
        render: (text, record) => (
            <span>
                Delete
            </span>
          ),
    }
];