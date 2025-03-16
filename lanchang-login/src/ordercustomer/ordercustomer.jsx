import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbarow } from "../owner/Navbarowcomponent/navbarow/index-ow";
import Table from '../ordercustomer/table';
import Menu from './menu';
import Noodle from './noodle';
import {
    setCreateOrder,
    addMenuToOrder,
    addNoodleToOrder,
    removeMenuFromOrder,
    removeNoodleFromOrder,
    updateMenuInOrder,
    updateNoodleInOrder,
    setTableForOrder,
} from '../slice/orderslice';

const Ordercustomer = () => {
    const dispatch = useDispatch();
    const { createOrder } = useSelector((state) => state.orders);

    const createBox = () => { 
        dispatch(setCreateOrder([...createOrder, { id: Date.now(), MenuList: [], NoodleList: [], TableList: null }]));
    };

    const closeBox = (id) => {
        if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการปิดออเดอร์?")) {
            dispatch(setCreateOrder(createOrder.filter(order => order.id !== id)));
        }
    };

    const AddMenu = (orderId) => {
        dispatch(addMenuToOrder({ orderId }));
    };

    const AddNoodle = (orderId) => {
        dispatch(addNoodleToOrder({ orderId }));
    };

    const RemoveMenu = (orderId, menuId) => {
        dispatch(removeMenuFromOrder({ orderId, menuId }));
    };

    const RemoveNoodle = (orderId, noodleId) => {
        dispatch(removeNoodleFromOrder({ orderId, noodleId }));
    };

    const AllMenu = useCallback((orderId, menuId, ...data) => {
        dispatch(updateMenuInOrder({ orderId, menuId, data }));
    }, [dispatch]);

    const AllNoodle = useCallback((orderId, noodleId, ...data) => {
        dispatch(updateNoodleInOrder({ orderId, noodleId, data }));
    }, [dispatch]);

    const OrderMenu = async (order) => {
        const { MenuList = [], NoodleList = [], TableList } = order;
        console.log('Order received:', JSON.stringify(order, null, 2));

        const confirm = window.confirm('ยืนยันการสั่งอาหารหรือไม่');
        if (!confirm) return;

        try {
           
            const createOrderResponse = await fetch('http://localhost:3333/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId: TableList }),
            });

            if (!createOrderResponse.ok) throw new Error('Failed to create new order');
            const { orderId } = await createOrderResponse.json();

            
            console.log('MenuList:', MenuList);
            console.log('NoodleList:', NoodleList);

            const items = [
                ...MenuList.map(item => {
                    return {
                        id: item.MenuId,
                        type: "menu",
                        quantity: parseInt(item.Qty),
                        price: item.Price,
                        homeDelivery: item.HomeDelivery ? 1 : 0,
                        additionalInfo: item.Additional || null,
                    };
                }),
                ...NoodleList.map(item => {
                    if (!item.NoodleComponent) {
                        throw new Error('Missing NoodleComponent');
                    }
                    return {
                        id: {
                            Noodle_type_id: item.NoodleComponent.noodleType,
                            Soup_id: item.NoodleComponent.soupType,
                            Meat_id: item.NoodleComponent.meatType,
                            Size_id: item.NoodleComponent.size,
                        },
                        type: "noodle",
                        quantity: parseInt(item.Qty),
                        price: item.Price,
                        homeDelivery: item.HomeDelivery ? 1 : 0,
                        additionalInfo: item.Additional || null,
                    };
                }),
            ];

           
            const response = await fetch(`http://localhost:3333/orders/${orderId}/add_items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems: items }),
            });

            if (!response.ok) throw new Error('failed to add items');
            const result = await response.json();
            console.log('Items added:', result);

            alert('Order successfully!');
        } catch (error) {
            console.error('Error ordering', error);
            alert('failed to process order');
        }
    };

    return (
        <div>
            <Navbarow />
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
                {createOrder.map(order => (
                    <div key={order.id} style={{
                        position: 'relative',
                        width: "400px",
                        height: "600px",
                        backgroundColor: 'pink',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '10px',
                        padding: '20px',
                        flexDirection: 'column'
                    }}>
                        <button
                            onClick={() => closeBox(order.id)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                color: 'black',
                                border: 'none',
                                fontSize: '20px',
                                width: '25px',
                                height: '25px',
                                cursor: 'pointer'
                            }}>
                            ✕
                        </button>

                        <div style={{ width: '100%', height: '90%', backgroundColor: 'yellow', padding: '10px' }}>
                            <div>
                                <Table onSelect={(table) => dispatch(setTableForOrder({ orderId: order.id, table }))} />
                            </div>
                            <div style={{ margin: '10px 0' }}>
                                <button onClick={() => AddMenu(order.id)}>Add Menu</button>
                                <button onClick={() => AddNoodle(order.id)}>Add Noodle</button>
                            </div>
                            <div style={{ width: '100%', height: '90%', overflowY: 'auto', position: 'relative' }}>
                                <div>
                                    {(order.MenuList || []).map(item => (
                                        <div key={item.id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '5px', borderRadius: '5px' }}>
                                            <button onClick={() => RemoveMenu(order.id, item.id)} style={{ marginRight: '5px' }}>✕</button>
                                            <Menu onSelect={(...menu) => AllMenu(order.id, item.id, ...menu)} />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    {(order.NoodleList || []).map(item => (
                                        <div key={item.id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '5px', borderRadius: '5px' }}>
                                            <button onClick={() => RemoveNoodle(order.id, item.id)} style={{ marginRight: '5px' }}>✕</button>
                                            <Noodle onSelect={(...noodle) => AllNoodle(order.id, item.id, ...noodle)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '5px' }}>
                            <button onClick={() => OrderMenu(order)}>สั่งออเดอร์</button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button type='button' style={{ padding: '10px 20px', fontSize: '16px' }} onClick={createBox}>
                    สร้างออเดอร์
                </button>
            </div>
        </div>
    );
};

export default Ordercustomer;