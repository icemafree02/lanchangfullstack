import React, { useState, useEffect } from 'react';

const AssociationAnalysis = () => {
  const [transactions, setTransactions] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minSupport, setMinSupport] = useState(0.02);
  const [minConfidence, setMinConfidence] = useState(0.2);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3333/association');
      const data = await response.json();
      
      if (data.success) {
        const transactionItems = data.data.transactions.map(i => i.items);
        setTransactions(transactionItems);
        calculateAssociationRules(transactionItems, minSupport, minConfidence);
      } else {
        setError('Failed to fetch data: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setError('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const calculateAssociationRules = (transactionData, minSup, minCon) => {
    try {
      // Step 1: Find all frequent itemsets
      const frequentItemsets = findFrequentItemsets(transactionData, minSup);
      
      // Step 2: Generate association rules
      const associationRules = generateAssociationRules(frequentItemsets, transactionData, minCon);
      
      // Format rules for display
      const formattedRules = associationRules.map(rule => ({
        id: `rule_${Math.random().toString(36).substr(2, 9)}`,
        antecedent: rule.antecedent.join(', '),
        consequent: rule.consequent.join(', '),
        support: rule.support,
        confidence: rule.confidence,
        lift: rule.lift
      }));
      
      setRules(formattedRules);
    } catch (error) {
      console.error('Error during association rule calculation:', error);
      setError('Error calculating association rules: ' + error.message);
    }
  };

  // Find all frequent itemsets using Apriori algorithm
  const findFrequentItemsets = (transactions, minSupport) => {
    // Get all unique items from transactions
    const items = new Set();
    transactions.forEach(transaction => {
      transaction.forEach(item => items.add(item));
    });
    
    // Initialize with 1-itemsets
    let L = Array.from(items).map(item => [item]);
    let result = [];
    let k = 1;
    
    while (L.length > 0) {
      // Find frequent k-itemsets
      const frequentItemsets = [];
      
      for (const itemset of L) {
        const support = calculateSupport(itemset, transactions);
        if (support >= minSupport) {
          frequentItemsets.push({
            itemset,
            support
          });
        }
      }
      
      // Add to result
      result = result.concat(frequentItemsets);
      
      // Generate candidates for next iteration
      if (frequentItemsets.length > 0) {
        const frequentItems = frequentItemsets.map(item => item.itemset);
        L = generateCandidates(frequentItems, k + 1);
        k++;
      } else {
        L = [];
      }
    }
    
    return result;
  };

  // Calculate support for an itemset
  const calculateSupport = (itemset, transactions) => {
    let count = 0;
    const totalTransactions = transactions.length;
    
    for (const transaction of transactions) {
      if (isSubset(itemset, transaction)) {
        count++;
      }
    }
    
    return count / totalTransactions;
  };

  // Check if itemset is a subset of transaction
  const isSubset = (itemset, transaction) => {
    return itemset.every(item => transaction.includes(item));
  };

  // Generate candidate itemsets of size k
  const generateCandidates = (frequentItemsets, k) => {
    const candidates = [];
    
    for (let i = 0; i < frequentItemsets.length; i++) {
      for (let j = i + 1; j < frequentItemsets.length; j++) {
        const itemset1 = frequentItemsets[i];
        const itemset2 = frequentItemsets[j];
        
        // Check if first k-2 items are the same
        let canJoin = true;
        for (let l = 0; l < k - 2; l++) {
          if (itemset1[l] !== itemset2[l]) {
            canJoin = false;
            break;
          }
        }
        
        if (canJoin && itemset1[k - 2] < itemset2[k - 2]) {
          const candidate = [...itemset1.slice(0, k - 1), itemset2[k - 2]];
          candidates.push(candidate);
        }
      }
    }
    
    return candidates;
  };

  // Generate association rules from frequent itemsets
  const generateAssociationRules = (frequentItemsets, transactions, minConfidence) => {
    const rules = [];
    
    for (const {itemset, support} of frequentItemsets) {
      if (itemset.length < 2) continue;
      
      // Generate all non-empty proper subsets
      const subsets = generateNonEmptySubsets(itemset);
      
      for (const antecedent of subsets) {
        if (antecedent.length === 0 || antecedent.length === itemset.length) continue;
        
        // Create consequent (itemset - antecedent)
        const consequent = itemset.filter(item => !antecedent.includes(item));
        if (consequent.length === 0) continue;
        
        // Calculate confidence
        const antecedentSupport = calculateSupport(antecedent, transactions);
        const confidence = support / antecedentSupport;
        
        if (confidence >= minConfidence) {
          // Calculate lift
          const consequentSupport = calculateSupport(consequent, transactions);
          const lift = confidence / consequentSupport;
          
          rules.push({
            antecedent,
            consequent,
            support,
            confidence,
            lift
          });
        }
      }
    }
    
    return rules;
  };

  // Generate all non-empty subsets of an array
  const generateNonEmptySubsets = (arr) => {
    const subsets = [[]];
    
    for (const item of arr) {
      const newSubsets = [];
      for (const subset of subsets) {
        newSubsets.push([...subset, item]);
      }
      subsets.push(...newSubsets);
    }
    
    return subsets.filter(subset => subset.length > 0 && subset.length < arr.length);
  };

  const handleParameterChange = () => {
    calculateAssociationRules(transactions, minSupport, minConfidence);
  };

  return (
    <div className="association-analysis">
      <h1>Menu Item Association Analysis</h1>
      
      <div className="parameters">
        <div className="parameter">
          <label>Minimum Support:</label>
          <input 
            type="number" 
            value={minSupport} 
            onChange={e => setMinSupport(parseFloat(e.target.value))}
            step="0.01" 
            min="0.01" 
            max="1"
          />
        </div>
        <div className="parameter">
          <label>Minimum Confidence:</label>
          <input 
            type="number" 
            value={minConfidence} 
            onChange={e => setMinConfidence(parseFloat(e.target.value))}
            step="0.05" 
            min="0.1" 
            max="1"
          />
        </div>
        <button onClick={handleParameterChange}>Update Rules</button>
      </div>
      
      {loading ? (
        <p>Loading transaction data...</p>
      ) : error ? (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchTransactionData}>Try Again</button>
        </div>
      ) : (
        <div className="results">
          <h2>Association Rules ({rules.length} rules found)</h2>
          <p>Analyzed {transactions.length} transactions with {minSupport * 100}% minimum support and {minConfidence * 100}% minimum confidence</p>
          
          {rules.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>If customer orders</th>
                  <th>They also order</th>
                  <th>Support</th>
                  <th>Confidence</th>
                  <th>Lift</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id}>
                    <td>{rule.antecedent}</td>
                    <td>{rule.consequent}</td>
                    <td>{(rule.support * 100).toFixed(2)}%</td>
                    <td>{(rule.confidence * 100).toFixed(2)}%</td>
                    <td>{rule.lift.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No rules found with current parameters. Try lowering minimum support or confidence.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AssociationAnalysis;