import React, { useState } from 'react';
import Menu from './menu';
import Noodle from './noodle';
import { X } from 'lucide-react';

function OrderCustomer() {
    const [menuItems, setMenuItems] = useState([]);
    const [noodleItems, setNoodleItems] = useState([]);

    const handleAddMenu = () => {
        setMenuItems([...menuItems, { id: Date.now(), data: {} }]);
    };

    const handleAddNoodle = () => {
        setNoodleItems([...noodleItems, { id: Date.now(), data: {} }]);
    };

    const handleRemoveMenu = (id) => {
        setMenuItems(menuItems.filter(item => item.id !== id));
    };

    const handleRemoveNoodle = (id) => {
        setNoodleItems(noodleItems.filter(item => item.id !== id));
    };

    const handleMenuSelect = (id, ...data) => {
        const updatedMenuItems = menuItems.map(item => (item.id === id ? { ...item, data } : item));
        setMenuItems(updatedMenuItems);
        console.log('Menu Items:', updatedMenuItems);
    };

    const handleNoodleSelect = (id, ...data) => {
        const updatedNoodleItems = noodleItems.map(item => (item.id === id ? { ...item, data } : item));
        setNoodleItems(updatedNoodleItems);
        console.log('Noodle Items:', updatedNoodleItems);
    };

    return (
        <div className="p-4 bg-gray-100 space-y-4">
            <div className="flex justify-center gap-4">
                <button onClick={handleAddMenu} className="bg-blue-500 text-white px-4 py-2 rounded">Add Menu</button>
                <button onClick={handleAddNoodle} className="bg-green-500 text-white px-4 py-2 rounded">Add Noodle</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map(item => (
                    <div key={item.id} className="relative border p-4 rounded bg-white shadow-md">
                        <button onClick={() => handleRemoveMenu(item.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                            <X size={18} />
                        </button>
                        <Menu onSelect={(...data) => handleMenuSelect(item.id, ...data)} />
                    </div>
                ))}
                {noodleItems.map(item => (
                    <div key={item.id} className="relative border p-4 rounded bg-white shadow-md">
                        <button onClick={() => handleRemoveNoodle(item.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                            <X size={18} />
                        </button>
                        <Noodle onSelect={(...data) => handleNoodleSelect(item.id, ...data)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderCustomer;
