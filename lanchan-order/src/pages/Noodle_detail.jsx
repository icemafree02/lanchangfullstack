import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../menu_detail.css';
import { addItemToCart } from '../slice/cartslice';
import noodle from '../image/noodle.png';

const NoodleDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedNoodle = useSelector(state => state.noodle.selectedItem);
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
    if (selectedNoodle) {
      dispatch(addItemToCart({
        id: {
          Noodle_type_id: selectedNoodle.Noodle_type_id,
          Soup_id: selectedNoodle.Soup_id,
          Meat_id: selectedNoodle.Meat_id,
          Size_id: selectedNoodle.Size_id
        },
        name: selectedNoodle.formattedName,
        price: selectedNoodle.Total_price,
        quantity,
        type: 'noodle',
        homeDelivery,
        additionalInfo
      }));
      console.log(`Added ${quantity} of ${selectedNoodle.formattedName} to cart.`);
      navigate('/menu_order'); 
    }
};

  useEffect(() => {
    if (!selectedNoodle) {
      navigate('/menu_order');
    }
  }, [selectedNoodle, navigate]);

  return (
    <div>
      <header className="header"></header>
      <div className="picture">
        <div id="noodle-detail-container">
          {selectedNoodle ? (
            <div>
              <img
                className="picture-detail"
                src={noodle}
                alt={selectedNoodle.formattedName}
              />
              <h2 className="title">{selectedNoodle.formattedName}</h2>
              <p className="price">{selectedNoodle.Total_price} บาท</p>
            </div>
          ) : (
            <p>No noodle selected. Please go back and choose a noodle.</p>
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
          placeholder="รายละเอียดเพิ่มเติม เช่น ไม่ใส่ผัก เผ็ดมาก"
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

export default NoodleDetail;
