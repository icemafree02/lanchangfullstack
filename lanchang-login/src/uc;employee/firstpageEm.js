import { Navbarem } from "./Navbaremcomponent/navbarem/index-em";


function em() {
    return (
        <div className="em">
            <Navbarem />
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
                <h1 style={{ marginBottom: '0.5em', color: 'green' }}>ยินดีต้อนรับ</h1>
                <h2>พนักงานร้านสู่ระบบจัดการร้านเตี๋ยวเรือล้านช้าง</h2>
            </div>
        </div>
    )
}

export default em