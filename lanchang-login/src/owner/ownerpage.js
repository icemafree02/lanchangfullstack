import { Navbarow } from "./Navbarowcomponent/navbarow/index-ow";
import React from 'react';

function OwnerPage() {
  return (
    <div className="ow">
      <Navbarow />
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
        <h1 style={{ marginBottom: '0.5em',color:'purple' }}>ยินดีต้อนรับ</h1>
        <h2>เจ้าของร้านสู่ระบบจัดการร้านเตี๋ยวเรือล้านช้าง</h2>
      </div>
    </div>
  );
}

export default OwnerPage;
