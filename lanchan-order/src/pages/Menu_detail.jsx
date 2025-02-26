import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../menu_detail.css';
import { addItemToCart } from '../slice/cartslice';

const MenuDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedMenu = useSelector(state => state.menu.selectedItem);
  const [quantity, setQuantity] = useState(1);
  const [homeDelivery, setHomeDelivery] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleQuantityChange = (amount) => {
    setQuantity(prevQuantity => Math.max(prevQuantity + amount, 1));
  };

  const handleHomeDeliveryChange = () => {
    setHomeDelivery(prev => !prev);
  };

  const handleAddToCart = () => {
    if (selectedMenu) {
      dispatch(addItemToCart({
        id: selectedMenu.Menu_id,
        name: selectedMenu.Menu_name,
        price: selectedMenu.Menu_price,
        type: 'menu',
        quantity,
        homeDelivery,
        additionalInfo,
      }));
      console.log(`Added ${quantity} of ${selectedMenu.Menu_name} to cart.`);
      navigate('/menu_order'); 
    }
  };

  useEffect(() => {
    if (!selectedMenu) {
      navigate('/menu_order');
    }
  }, [selectedMenu, navigate]);

  return (
    <div>
      <header className="header"></header>

      <div className="picture">
        <div id="menu-detail-container">
          {selectedMenu ? (
            <div>
              <img
                className="picture-detail"
                src={`http://localhost:3333/menuimage/${selectedMenu.Menu_id}`}
                alt={selectedMenu.Menu_name}
              />
              <h2 className="title">{selectedMenu.Menu_name}</h2>
              <p className="price">{selectedMenu.Menu_price} บาท</p>
            </div>
          ) : (
            <p>ไม่มีเมนูที่เลือก</p>
          )}
        </div>
      </div>

      <div className="takehome">
        <input
          type="checkbox"
          id="homeDelivery"
          className="checker"
          checked={homeDelivery}
          onChange={handleHomeDeliveryChange}
        />
        <label htmlFor="homeDelivery" className="takehome">สั่งกลับบ้าน</label>
      </div>

      <div className="additional">
        <textarea
          rows="7"
          cols="55"
          placeholder="รายละเอียดเพิ่มเติม เช่น ขอซอสเยอะๆ น้ำจิ้มเยอะๆ"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        ></textarea>
      </div>

      <div className='addspace'></div>

      <footer>
        <div className="left">
          <div className="counter">
            <button
              id="decrease"
              className="decrement"
              onClick={() => handleQuantityChange(-1)}
            >
              -
            </button>

            <span id="quantity" className="value">{quantity}</span>
            
            <button
              id="increase"
              className="increment"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </button>
          </div>
          <button
            id="additem"
            className="btn btn-outline-success"
            onClick={handleAddToCart}
          >
            เพิ่มลงตะกร้า
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MenuDetail;
