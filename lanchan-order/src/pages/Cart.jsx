import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { increaseQuantity, decreaseQuantity, removeItemFromCart, clearCart } from '../slice/cartslice';
import '../cart.css';
import noodle from '../image/noodle.png';
import { setOrderId } from '../slice/cartslice';

const Cart = () => {
  const cartItems = useSelector(state => state.cart.items);
  const selectedTable = useSelector(state => state.table.selectedTable);
  const orderId = useSelector(state => state.cart.orderId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(cartItems);
  });

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem('orderId'); // ✅ Use sessionStorage instead
    if (storedOrderId) {
      dispatch(setOrderId(Number(storedOrderId)));
    }
    console.log("Current tab orderId:", storedOrderId);
  }, [dispatch]);


  const handleIncrease = (item) => {
    dispatch(increaseQuantity({
      id: item.id,
      type: item.type,
      homeDelivery: item.homeDelivery,
      additionalInfo: item.additionalInfo
    }));
  };

  const handleDecrease = (item) => {
    dispatch(decreaseQuantity({
      id: item.id,
      type: item.type,
      homeDelivery: item.homeDelivery,
      additionalInfo: item.additionalInfo
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeItemFromCart({
      id: item.id,
      type: item.type,
      homeDelivery: item.homeDelivery,
      additionalInfo: item.additionalInfo
    }));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getImageSource = (item) => {
    if (item.type === 'noodle') {
      return noodle;
    } else if (item.type === 'menu') {
      return `http://localhost:3333/menuimage/${item.id}`;
    }
    return '';
  };

  const handleOrderMenu = async () => {
    try {
      
        const url = `http://localhost:3333/orders/${orderId}/add_items`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems: cartItems.map(item => ({
              id: item.id,
              type: item.type,
              quantity: item.quantity,
              price: item.price,
              homeDelivery: item.homeDelivery || 0,
              additionalInfo: item.additionalInfo || null,
            })),
          }),
        });
        const result = await response.json();
        dispatch(clearCart());
        navigate('/menu_order/cart/menu_ordered');
      
    }
    catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  return (
    <div>
      <header>
        <div className='titlecart'>ตระกร้าของคุณ</div>
      </header>
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <p>ไม่มีรายการอาหาร</p>
        ) : (
          <div>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={`${item.type}-${item.id}`} className="cart-item">
                  <img
                    src={getImageSource(item)}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <div className='cart-name'>{item.name}</div>
                    <p>ราคา {item.price} บาท</p>
                    {item.homeDelivery && <p className='takehomenote'>สั่งกลับบ้าน</p>}
                    {item.additionalInfo && <p className='additionalnote'>เพิ่มเติม : {item.additionalInfo}</p>}
                    <div className="cart-item-controls">
                      <button className="quantity-btn" onClick={() => handleDecrease(item)}>-</button>
                      <span className="quantity">{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => handleIncrease(item)}>+</button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemove(item)}>ลบ</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h4>{getTotalCartItems()} รายการ</h4>
              <h3 className='quantities'>ราคารวม {getTotalPrice()} บาท</h3>
            </div>
            <button className="order-btn" onClick={handleOrderMenu}>สั่งอาหาร</button>
          </div>
        )}
      </div>
      <div className='center'>
        <button className="view-ordered-btn" onClick={() => navigate('/menu_order/cart/menu_ordered')}>ดูรายการที่สั่ง</button>
      </div>
    </div>
  );
};

export default Cart;
