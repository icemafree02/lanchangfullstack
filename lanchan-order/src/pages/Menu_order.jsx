import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../menu_order.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import lanchan from '../image/lanchan.png';
import cart from '../image/cart.jpg';
import { fetchMenuData, fetchMenuItemDetail } from '../slice/menuslice';
import { setSelectedNoodle } from '../slice/noodleslice';

const MenuOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedTable = useSelector(state => state.table.selectedTable);
  const menuItems = useSelector(state => state.menu.items);
  const noodleItems = useSelector(state => state.noodle.items);
  const cartItems = useSelector(state => state.cart.items);
  const location = useLocation();
  const { orderId } = location.state || {};
  const [originalItems, setOriginalItems] = useState([]);
  const [isNoodleCustomization, setIsNoodleCustomization] = useState(false);
  const [noodleOptions, setNoodleOptions] = useState({
    soupType: '',
    noodleType: '',
    meatType: '',
    size: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState({ noodles: [], menus: [] });
  const [activeCategory, setActiveCategory] = useState('all');
  const [soups, setSoups] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [meats, setMeats] = useState([]);
  const [noodleTypes, setNoodleTypes] = useState([]);

  const fetchInitialMenu = async () => {
    try {
      const response = await fetch('http://localhost:3333/menu');
      const menuItems = await response.json();
      setFilteredItems({ noodles: [], menus: menuItems });
      setOriginalItems(menuItems);
      setActiveCategory('menu');
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  useEffect(() => {
    fetchInitialMenu();
    fetchAllComponent();
  }, []);


  const handleMenuItemClick = (item) => {
    if (item.Menu_id) {
      dispatch(fetchMenuItemDetail(item.Menu_id))
        .then(() => navigate('/menu_order/menu_detail'));
    }
  };

  const handleNoodleClick = () => {
    setIsNoodleCustomization(!isNoodleCustomization);
    setActiveCategory('noodle');
  };

  const handleNoodleOptionChange = (option, value) => {
    setNoodleOptions(prev => ({ ...prev, [option]: value }));
  };

  const handleCartClick = () => {
    navigate('/menu_order/cart');
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchTerm.trim()) {
      setFilteredItems({ noodles: [], menus: originalItems });
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    let filteredMenus = originalItems.filter(item =>
      item.Menu_name.toLowerCase().includes(searchTermLower)
    );

    setFilteredItems({
      noodles: [],
      menus: filteredMenus
    });
  };

  const filterByCategory = (category) => {
    setActiveCategory(category);
    setIsNoodleCustomization(category === 'noodle');
    if (category !== 'noodle') {
      const fetchCategoryItems = async () => {
        try {
          let response;
          switch (category) {
            case 'beverage':
              response = await fetch('http://localhost:3333/menu');
              break;
            case 'appetizer':
              response = await fetch('http://localhost:3333/menu');
              break;
            case 'other':
              response = await fetch('http://localhost:3333/menu');
              break;
            default:
              setFilteredItems({ noodles: [], menus: [] });
              return;
          }

          const data = await response.json();
          if (category === 'beverage') {
            const beverageItems = data.filter(item => item.Menu_category === "เครื่องดื่ม");
            setFilteredItems({ noodles: [], menus: beverageItems });
          } else if (category === 'appetizer') {
            const appetizerItems = data.filter(item => item.Menu_category === "เครื่องเคียง");
            setFilteredItems({ noodles: [], menus: appetizerItems });
          } else if (category === 'other') {
            const otherItems = data.filter(item => item.Menu_category === "เมนูอื่น");
            setFilteredItems({ noodles: [], menus: otherItems });
          }
        } catch (error) {
          console.error('Error fetching category items:', error);
          setFilteredItems({ noodles: [], menus: [] });
        }
      };

      fetchCategoryItems();
    }
  };

  const handleAllMenuClick = async () => {
    try {
      setIsNoodleCustomization(false);
      setActiveCategory('all');

      const response = await fetch('http://localhost:3333/menu');
      const data = await response.json();
      setFilteredItems({ noodles: [], menus: data });

    } catch (error) {
      console.error('Error fetching all menu items:', error);
    }
  };

  const fetchAllComponent = async () => {
    try {
      const [soupRes, sizeRes, meatRes, noodleTypeRes] = await Promise.all([
        fetch('http://localhost:3333/soups'),
        fetch('http://localhost:3333/sizes'),
        fetch('http://localhost:3333/meats'),
        fetch('http://localhost:3333/noodletypes')
      ]);

      const [soupData, sizeData, meatData, noodleTypeData] = await Promise.all([
        soupRes.json(),
        sizeRes.json(),
        meatRes.json(),
        noodleTypeRes.json()
      ]);
      setSoups(soupData);
      setSizes(sizeData);
      setMeats(meatData);
      setNoodleTypes(noodleTypeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const renderNoodleCustomization = () => (
    <div className='noodlesearch'>
      <div className="noodle-customization">
        <div className='noodletype'>
          <div>เส้น</div>
          {noodleTypes.map((noodletype) => (
            <label className='name' key={noodletype.Noodle_type_id}>
              <input
                className='label'
                type="radio"
                name="noodleType"
                value={noodletype.Noodle_type_id}
                checked={noodleOptions.noodleType === noodletype.Noodle_type_id}
                onChange={(e) => handleNoodleOptionChange('noodleType', noodletype.Noodle_type_id)}
              />
              {noodletype.Noodle_type_name}
            </label>
          ))}
        </div>
        <div className='souptype'>
          <div>น้ำซุป</div>
          {soups.map((soup) => (
            <label className='name' key={soup.Soup_id}>
              <input
                className='label'
                type="radio"
                name="soupType" 
                value={soup.Soup_id}
                checked={noodleOptions.soupType === soup.Soup_id}
                onChange={(e) => handleNoodleOptionChange('soupType', soup.Soup_id)}
              />
              {soup.Soup_name}
            </label>
          ))}
        </div>
        <div className='meat'>
          <div>เนื้อ</div>
          {meats.map((meat) => (
            <label className='name' key={meat.Meat_id}>
              <input
                className='label'
                type="radio"
                name="meatType"
                value={meat.Meat_id}
                checked={noodleOptions.meatType === meat.Meat_id}
                onChange={(e) => handleNoodleOptionChange('meatType', meat.Meat_id)}
              />
              {meat.Meat_name}
            </label>
          ))}
        </div>
        <div className='size'>
          <div>ขนาด</div>
          {sizes.map((size) => (
            <label className='name' key={size.Size_id}>
              <input
                className='label'
                type="radio"
                name="size"
                value={size.Size_id}
                checked={noodleOptions.size === size.Size_id}
                onChange={(e) => handleNoodleOptionChange('size', size.Size_id)}
              />
              {size.Size_name}
            </label>
          ))}
        </div>
      </div>
      <button className="btn btn-outline-success" id='noodlesearchbtn' onClick={handleNoodleSearch}>สั่งเมนูก๋วยเตี๋ยว</button>
    </div>
  );

  const handleNoodleSearch = async () => {
    const { noodleType, soupType, meatType, size } = noodleOptions;
    console.log(noodleOptions);
    if (!soupType || !noodleType || !meatType || !size) {
      alert('กรุณาเลือกตัวเลือกให้ครบทุกช่อง');
      return;
    }
    try {
      const response = await fetch('http://localhost:3333/noodle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noodleType, soupType, meatType, size }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data) {
        const selectedNoodle = data[0];
        console.log(selectedNoodle);
        const {
          Noodle_type_name: noodleTypeName,
          Soup_name: soupTypeName,
          Meat_name: meatTypeName,
          Size_name: sizeName
        } = selectedNoodle;
        const formattedNoodleName = `${noodleTypeName} ${soupTypeName} ${meatTypeName} ${sizeName}`;
        const NoodleHeld = {
          ...selectedNoodle,
          formattedName: formattedNoodleName
        };
        console.log(NoodleHeld);
        await dispatch(setSelectedNoodle(NoodleHeld));
      
        navigate('/menu_order/noodle_detail');
      } else {
        alert('ไม่พบเมนูที่เลือก');
      }
    } catch (error) {
      console.error('Error searching for noodles:', error);
    }
  };

  return (
    <div>
      <div className="headbar">
        <div className="picturelogo">
          <img src={lanchan} alt="ร้านก๋วยเตี๋ยวเรือล้านช้าง" />
        </div>
        <div id="tableInfo">
          {selectedTable ? `โต๊ะของคุณ : ${selectedTable}` : 'ไม่มีโต๊ะที่เลือก'}
        </div>
        <form className="d-flex" role="search" onSubmit={handleSearch}>
          <input
            className="form-control me-2"
            type="search"
            placeholder="ค้นหาเมนู"
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-success" id="search">ค้นหา</button>
        </form>
        <div className="menubutton">
          <button
            type="button"
            id='noodlebtn'
            className={`btn btn-outline-success ${activeCategory === 'noodle' ? 'active' : ''}`}
            onClick={handleNoodleClick}
          >
            ก๋วยเตี๋ยว
          </button>
          <button
            type="button"
            id='allmenubtn'
            className={`btn btn-outline-success ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={handleAllMenuClick}
          >
            เมนูทั้งหมด
          </button>
          <button
            type="button"
            id='beveragebtn'
            className={`btn btn-outline-success ${activeCategory === 'beverage' ? 'active' : ''}`}
            onClick={() => filterByCategory('beverage')}
          >
            เครื่องดื่ม
          </button>
          <button
            type="button"
            id='appetizerbtn'
            className={`btn btn-outline-success ${activeCategory === 'appetizer' ? 'active' : ''}`}
            onClick={() => filterByCategory('appetizer')}
          >
            เครื่องเคียง
          </button>
          <button
            type="button"
            id='othermenubtn'
            className={`btn btn-outline-success ${activeCategory === 'other' ? 'active' : ''}`}
            onClick={() => filterByCategory('other')}
          >
            เมนูอื่นๆ
          </button>
        </div>
      </div>

      <div id="menu-container">
        {isNoodleCustomization ? renderNoodleCustomization() : (
          filteredItems.menus.map(item => (
            <div key={item.Menu_id} className="menu-item" onClick={() => handleMenuItemClick(item)}>
              <img className="menu-picture" src={`http://localhost:3333/menuimage/${item.Menu_id}`} alt={item.Menu_name} />
              <div className="menu-name">{item.Menu_name}</div>
              <div className="menu-price">{item.Menu_price} บาท</div>
            </div>
          ))
        )}
      </div>

      <div>
        <div className="cart" onClick={handleCartClick}>
          <img src={cart} id="cartpic" alt="Cart" />
        </div>
        <div className="numberorder">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default MenuOrder;
