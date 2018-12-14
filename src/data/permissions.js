import React from 'react';
export const columns = [
    {
        title: '权限名称',
        dataIndex: 'address',
        key: 'address',
        align:'center',
    }, 
    {
        title: '权限管理概述',
        dataIndex: 'name',
        key: 'name',
        align:'center',
    }, 
    {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
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