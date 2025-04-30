import React, { useEffect, useState } from 'react';
import { Navbarow } from "../owner/Navbarowcomponent/navbarow/index-ow";
import './association.css';

const Association = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Filter parameters
  const [minSupport, setMinSupport] = useState(0.2);
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [minLift, setMinLift] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Main function to fetch apriori results
  const fetchAprioriResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create URLSearchParams object for query parameters
      const params = new URLSearchParams({
        min_support: minSupport,
        min_confidence: minConfidence,
        min_lift: minLift,
      });

      // Only add date parameters if they exist
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      // Append query string to URL
      const response = await fetch(`http://localhost:3333/association?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.aprioriResults);
        setTransactions(data.transactions);
      } else {
        setError(data.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAprioriResults();
  };

  return (
    <div>
      <Navbarow />
      <div className="apriori-container">
        <h1>วิเคราะห์ความสัมพันธ์เมนูอาหาร</h1>
        <form onSubmit={handleSubmit} className="parameters-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">วันที่เริ่ม :</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">วันที่สิ้นสุด :</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minSupport">ค่า Support ขั้นต่ำ :</label>
              <input
                id="minSupport"
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                value={minSupport}
                onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                className="numeric-input"
              />
              <span className="hint">กำหนดค่าให้อยู่ระหว่าง 0 และ 1 (0.01 = 1%)</span>
            </div>

            <div className="form-group">
              <label htmlFor="minConfidence">ค่า Confidence ขั้นต่ำ :</label>
              <input
                id="minConfidence"
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="numeric-input"
              />
              <span className="hint">กำหนดค่าให้อยู่ระหว่าง 0 และ 1 (0.01 = 1%)</span>
            </div>

            <div className="form-group">
              <label htmlFor="minLift">ค่า Lift ขั้นต่ำ :</label>
              <input
                id="minLift"
                type="number"
                step="0.1"
                min="1"
                value={minLift}
                onChange={(e) => setMinLift(parseFloat(e.target.value))}
                className="numeric-input"
              />
              <span className="hint">หากค่าเกิน 1 หมายถึงความสัมพันธ์อยู่ในเชิงบวก</span>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'กำลังคำนวน...' : 'คำนวนผลลัพธ์'}
            </button>
            <h2>จำนวนออเดอร์ทั้งหมด : {transactions.length} รายการ</h2>
            {startDate && endDate && (
              <h3>ตั้งแต่วันที่ : {startDate} ถึง {endDate}</h3>
            )}
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {results && (
          <div className="results-container">
            <div className="association-rules">
              <h2>ผลลัพธ์ความสัมพันธ์เมนูอาหาร</h2>
              {(!results.associationRules || results.associationRules.length === 0) ? (
                <p>ไม่พบผลลัพธ์ควาสัมพันธ์เมนู ลดระดับค่าต่างๆเพื่อแสดงผลลัพธ์ใหม่</p>
              ) : (
                <table className="rules-table">
                  <thead>
                    <tr>
                      <th>หากลูกค้าสั่ง</th>
                      <th>แล้วจะสั่ง</th>
                      <th>Support</th>
                      <th>Confidence</th>
                      <th>Lift</th>
                    </tr>
                  </thead>
                  <tbody id='rules-table-body'>
                    {results.associationRules.map((rule, index) => (
                      <tr key={index}>
                        <td>{rule.lhs.join(', ')}</td>
                        <td>{rule.rhs.join(', ')}</td>
                        <td>{(rule.support * 100).toFixed(2)}%</td>
                        <td>{(rule.confidence * 100).toFixed(2)}%</td>
                        <td>{rule.lift.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="frequent-itemsets">
              <h2>รายการเมนูที่ถูกสั่งบ่อย</h2>
              {(!results.frequentItemsets || results.frequentItemsets.length === 0) ? (
                <p>ไม่มีรายการเมนู</p>
              ) : (
                <table className="itemsets-table">
                  <thead>
                    <tr>
                      <th>เมนู</th>
                      <th>Support</th>
                    </tr>
                  </thead>
                  <tbody id='itemsets-table-body'>
                    {results.frequentItemsets.map((itemset, index) => (
                      <tr key={index}>
                        <td>{itemset.items.join(', ')}</td>
                        <td>{(itemset.support * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Association;