import React from 'react';
import {bigNumber} from '../utils/0xExchange';
export const columns = [
    {
        title: 'Hash',
        dataIndex: 'hash',
        key: 'hash',
        align:'center',
    }, 
    {
        title: 'From',
        dataIndex: 'sender',
        key: 'From',
        align:'center',
        render:sender=><span>{"0x"+sender.address}</span>
    }, 
    {
        title: 'To',
        dataIndex: 'transaction',
        key: 'to',
        align:'center',
        render:transaction=><span>{"0x"+transaction.to}</span>
    },
    {
        title: 'Amount',
        dataIndex: 'transaction',
        key: 'value',
        align:'center',
        render: transaction => <span>{bigNumber(transaction.value)}</span>
    }
];