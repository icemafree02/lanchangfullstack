
import { Navbar } from "./Navbarcomponent/navbarma/index";
import React from 'react';

function firstpage() {
  return (
    <div className="App">
      <Navbar />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '0.5em',color:'orange' }}>ยินดีต้อนรับ</h1>
        <h2>ผู้จัดการร้านสู่ระบบจัดการร้านเตี๋ยวเรือล้านช้าง</h2>
      </div>
    </div>
    
  );
}

export default firstpage;
