import React, { useState, useEffect } from 'react';

function fetchMenu() {
    return fetch('http://localhost:3333/menu')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network is not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Failed to fetch Menu', error);
            return [];
        });
}

function Menu({ onSelect }) {
    const [menu, setMenu] = useState([]);
    const [searchMenu, setSearchMenu] = useState('');
    const [dropdown, setDropdown] = useState(false);
    const [menuId, setMenuId] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState([]);
    const [price, setPrice] = useState(null);
    const [qty, setQty] = useState(1);
    const [additional, setAdditional] = useState('');
    const [homeDelivery, setHomeDelivery] = useState(false);

    useEffect(() => {
        fetchMenu().then(data => setMenu(data));
    }, []);

    useEffect(() => {
        onSelect({
            MenuId: menuId,
            MenuName: selectedMenu,
            Price: price,
            Qty: qty,
            Additional: additional,
            HomeDelivery: homeDelivery
        });
    }, [menuId, selectedMenu, price, qty, additional, homeDelivery]);

    const search = (event) => {
        setSearchMenu(event.target.value);
        setDropdown(true);
    };

    const selectItem = (menuName) => {
        setSearchMenu(menuName);
        setSelectedMenu(menuName);
        setDropdown(false);
    };

    const searchTerm = searchMenu.trim().toLowerCase();

    const menuList = menu.filter(item => {
        return item.Menu_name?.toLowerCase().includes(searchTerm);
    });

    return (
        <div style={{ backgroundColor: 'white', padding: '10px' }}>
            <input
                type="text"
                value={searchMenu}
                placeholder="ค้นหาเมนู"
                onChange={search}
                onFocus={() => setDropdown(true)}
            />

            {dropdown && searchMenu && (
                <div
                    style={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        width: '100%',
                        cursor: 'pointer',
                        padding: '5px'
                    }}
                >
                    {menuList.length > 0 ? (
                        menuList.map((item) => (
                            <div
                                key={item.Menu_id}
                                onClick={() => {
                                    selectItem(item.Menu_name)
                                    setMenuId(item.Menu_id)
                                    setPrice(item.Menu_price)
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {item.Menu_name}
                            </div>

                        ))
                    ) : (
                        <div>ไม่พบเมนู</div>
                    )}
                </div>
            )
            }

            <div>
                <input
                    style={{ width: '15%' }}
                    type="number"
                    placeholder="จำนวน"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                />
            </div>

            <label style={{ marginLeft: '10px' }}>
                <input
                    type="checkbox"
                    checked={homeDelivery}
                    onChange={(e) => setHomeDelivery(e.target.checked)}
                />
                Take Home
            </label>

            <textarea
                placeholder="เพิ่มเติม"
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
            />
        </div >
    );
}

export default Menu;
