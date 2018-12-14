import React from 'react';
export const columns = [
    {
        title: '节点钱包地址',
        dataIndex: 'address',
        key: 'address',
        align:'center',
    }, 
    {
        title: '节点权重(%)',
        dataIndex: 'stake',
        key: 'stake',
        align:'center'
    }, 
    {
        title: '当前状态',
        dataIndex: 'status',
        key: 'status',
        align:'center',
        render:(text, record)=>(
            <div>
                <p style={{display:text === "1"? "block":"none"}}><span style={{display:"inline-block",width:"10px",height:"10px",borderRadius:"5px",backgroundColor:"#3EDDDF",marginRight:"5px"}}></span>正常</p>
                <p style={{display:text === "0"? "block":"none"}}><span style={{display:"inline-block",width:"10px",height:"10px",borderRadius:"5px",backgroundColor:"#FF6176",marginRight:"5px"}}></span>掉线</p>
            </div>
        )
    },
    {
        title: '管理',
        key: 'action',
        align:'center',
        render: (text, record) => (
            <a href="javacript:;">
                delete
            </a>
          ),
    }
];