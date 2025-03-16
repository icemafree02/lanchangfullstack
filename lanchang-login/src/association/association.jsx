import React, { useEffect, useState } from 'react';
import { Navbarow } from "../owner/Navbarowcomponent/navbarow/index-ow";
import './association.css';

class Apriori {
  constructor(transactions, minSupport = 0.2, minConfidence = 0.5, lift = 0) {
    this.transactions = transactions;
    this.minSupport = minSupport;
    this.minConfidence = minConfidence;
    this.itemsets = {};
    this.lift = lift;
    this.rules = [];
  }

  generateFrequentItemsets() {
    const items = new Set();
    console.log(this.transactions);
    this.transactions.forEach(transaction => {
      transaction.forEach(item => items.add(item));
    });
   // console.log(items);
    const frequentItems = {};
    
    for (const item of items) {
     // console.log(item);
      const support = this.calculateSupport([item]);
      if (support >= this.minSupport) {
        frequentItems[JSON.stringify([item])] = support;
    //    console.log(frequentItems);
      }
    }
    
   // console.log(frequentItems);
    return frequentItems;
  }

  calculateSupport(itemset) {
  //  console.log(itemset);
    let count = 0;
    for (const transaction of this.transactions) {
      if (itemset.every(item => transaction.includes(item))) {
        count++;
      }
    }
    
    return count / this.transactions.length;
  }
  // run Apriori
  run() {
    let k = 1;
    let frequentItemsets = this.generateFrequentItemsets();
    console.log(frequentItemsets);

    this.itemsets = { ...frequentItemsets };
    console.log(this.itemsets);
    //console.log(Object.keys(frequentItemsets));
    while (Object.keys(frequentItemsets).length > 0) {
      k++;
      frequentItemsets = this.generateCandidateItemsets(frequentItemsets, k);
      //console.log(Object.assign(this.itemsets, frequentItemsets));
      Object.assign(this.itemsets, frequentItemsets);
    }

    this.generateRules();
    return {
      itemsets: this.itemsets,
      rules: this.rules
    };
  }

  generateCandidateItemsets(frequentItemsets, k) {
    const candidates = {};
    const prevItemsets = Object.keys(frequentItemsets).map(key => JSON.parse(key));
    console.log(prevItemsets);

    for (let i = 0; i < prevItemsets.length; i++) {
      for (let j = i + 1; j < prevItemsets.length; j++) {
        //console.log(i,j);
        const itemset1 = prevItemsets[i];
        const itemset2 = prevItemsets[j];

        //console.log(itemset2);
        //console.log(itemset2[0]);

        //เช็คว่าค่าตรงกันมั้ย
        let join = true;
        console.log(k-2);
        for (let l = 0; l < k - 2; l++) {
          console.log(l);
          console.log(itemset1[l])
          console.log(itemset2[l])

          if (itemset1[l] !== itemset2[l]) {
            join = false;
            break;
          }
        }
        console.log(itemset1[k - 2] , itemset2[k - 2]);

        if (join && itemset1[k - 2] < itemset2[k - 2]) {
          const newItemset = [...itemset1.slice(0, k - 1), itemset2[k - 2]];
          //console.log(newItemset);
          const support = this.calculateSupport(newItemset);
          if (support >= this.minSupport) {
            candidates[JSON.stringify(newItemset)] = support;
            console.log(candidates);
          }
        }
      }
    }
    return candidates;
  }

  generateRules() {
    this.rules = [];

    for (const item in this.itemsets) {
      console.log(item);
      const itemset = JSON.parse(item);
      if (itemset.length < 2) continue;

      for (let i = 1; i < Math.pow(2, itemset.length) - 1; i++) {
        const firstitem = [];
        const seconditem = [];

        for (let j = 0; j < itemset.length; j++) {
          if ((i & (1 << j)) > 0) {
            firstitem.push(itemset[j]);
          } else {
            seconditem.push(itemset[j]);
          }
        }

        if (firstitem.length > 0 && seconditem.length > 0) {
          const confidence = this.itemsets[item] / this.calculateSupport(firstitem);
          const lift = this.itemsets[item] / (this.calculateSupport(firstitem) * this.calculateSupport(seconditem));
          if (confidence >= this.minConfidence && lift ) {
            this.rules.push({
              firstitem,
              seconditem,
              support: this.itemsets[item],
              confidence,
              lift
            });
          }
        }
      }
    }

    // Sort rules by confidence (descending)
    this.rules.sort((a, b) => b.confidence - a.confidence);
  }
}

// React component for displaying association rules
const Association = () => {
  const [transactions, setTransactions] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minSupport, setMinSupport] = useState(0.02);
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [error, setError] = useState(null);

  // Fetch transaction data from your backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3333/association');
      const data = await response.json();

      if (data.success) {
        const transactionItems = data.data.transactions.map(t => t.items);
        setTransactions(transactionItems);

        // Run Apriori on the transaction data
        if (transactionItems.length > 0) {
          console.log(transactionItems);
          const apriori = new Apriori(transactionItems, minSupport, minConfidence);
          const result = apriori.run();
          setRules(result.rules);
        }
      } else {
        setError(data.error || 'Failed to retrieve transaction data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRunAnalysis = () => {
    if (transactions.length > 0) {
      const apriori = new Apriori(transactions, minSupport, minConfidence);
      const result = apriori.run();
      setRules(result.rules);
    }
  };

  return (
    <div>
      <Navbarow />
      <div className="container">
        <div className="title">
          <h1>วิเคราะห์ความสัมพันธ์รายการอาหาร</h1>
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Controls Section */}
        <div className="controls-container">
          <div className="controls-grid">

            {/* Minimum Support */}
            <div className="control-item">
              <label>
                Minimum Support ({(minSupport * 100).toFixed(1)}%)
              </label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={minSupport}
                onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              />
              <p className="helper-text">
                สินค้าต้องปรากฏอย่างน้อย {(minSupport * 100).toFixed(1)}% ของออเดอร์ทั้งหมด
              </p>
            </div>

            {/* Minimum Confidence */}
            <div className="control-item">
              <label>
                Minimum Confidence ({(minConfidence * 100).toFixed(1)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              />
              <p className="helper-text">
                กฎต้องเป็นจริงอย่างน้อย {(minConfidence * 100).toFixed(1)}% ของกรณี
              </p>
            </div>
          </div>

          <div className="button-container">
            <button
              onClick={handleRunAnalysis}
              disabled={loading || transactions.length === 0}
              className={`button ${loading || transactions.length === 0 ? "disabled" : "primary"}`}
            >
              {loading ? "กำลังประมวลผล" : "วิเคราะห์ข้อมูล"}
            </button>
          </div>

          <div className="transaction-count">
            ข้อมูลทั้งหมด: {transactions.length} รายการ
          </div>
        </div>

        <div className="rules-container">
          <h2 className="rules-title">กฎความสัมพันธ์</h2>

          {rules.length === 0 ? (
            <p className="rules-empty">
              {transactions.length === 0
                ? "ยังไม่มีข้อมูลธุรกรรม"
                : "ไม่พบกฎความสัมพันธ์ที่ตรงตามเงื่อนไข"}
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>หากลูกค้าสั่ง</th>
                    <th>มักจะสั่งเพิ่ม</th>
                    <th className="text-right">Support</th>
                    <th className="text-right">Confidence</th>
                    <th className="text-right">Lift</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, index) => (
                    <tr key={index}>
                      <td>{rule.firstitem}</td>
                      <td>{rule.seconditem}</td>
                      <td className="text-right">
                        {(rule.support * 100).toFixed(2)}%
                      </td>
                      <td className="text-right">
                        {(rule.confidence * 100).toFixed(2)}%
                      </td>
                      <td className="text-right">
                        {(rule.lift.toFixed(2))}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default Association;