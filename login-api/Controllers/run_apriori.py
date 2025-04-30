import sys
import json
import pandas as pd
from collections import Counter
from mlxtend.frequent_patterns import apriori, association_rules

def expand_transaction(transaction):
    """แปลงเมนูซ้ำให้กลายเป็นชื่อไม่ซ้ำ เช่น ไก่ → ไก่, ไก่_2, ไก่_3"""
    counter = Counter(transaction)
    expanded = []
    for item, count in counter.items():
        if count == 1:
            expanded.append(item)
        else:
            for i in range(1, count + 1):
                suffix = f"_{i}" if i > 1 else ""
                expanded.append(f"{item}{suffix}")
    return expanded

def run_apriori(transactions, min_support=0.01, min_confidence=0.5, min_lift=1.0):
    try:
        if not transactions:
            return {
                'frequentItemsets': [],
                'associationRules': []
            }

        # ขยายรายการที่ซ้ำภายในออเดอร์
        transactions = [expand_transaction(t) for t in transactions]

        # รวบรวมรายการทั้งหมด
        all_items = sorted(set(item for transaction in transactions for item in transaction))

        # one-hot encoding
        transactions_encoded = pd.DataFrame(
            [[1 if item in transaction else 0 for item in all_items]
             for transaction in transactions],
            columns=all_items
        )

        # คำนวณ frequent itemsets
        frequent_itemsets = apriori(transactions_encoded,
                                    min_support=min_support,
                                    use_colnames=True)

        # สร้าง association rules
        rules = association_rules(frequent_itemsets,
                                  metric="confidence",
                                  min_threshold=min_confidence)

        # กรองด้วย lift
        rules = rules[rules['lift'] >= min_lift]

        # จัดรูปแบบผลลัพธ์
        result_itemsets = []
        for _, row in frequent_itemsets.iterrows():
            result_itemsets.append({
                'items': list(row['itemsets']),
                'support': float(row['support'])
            })

        result_rules = []
        for _, row in rules.iterrows():
            result_rules.append({
                'lhs': list(row['antecedents']),
                'rhs': list(row['consequents']),
                'support': float(row['support']),
                'confidence': float(row['confidence']),
                'lift': float(row['lift'])
            })

        return {
            'frequentItemsets': result_itemsets,
            'associationRules': result_rules
        }

    except Exception as e:
        return {
            'error': str(e)
        }

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())

    transactions = input_data.get('transactions', [])
    min_support = float(input_data.get('minSupport', 0.01))
    min_confidence = float(input_data.get('minConfidence', 0.5))
    min_lift = float(input_data.get('minLift', 1.0))

    results = run_apriori(transactions, min_support, min_confidence, min_lift)

    print(json.dumps(results, ensure_ascii=False)) 
    sys.stdout.flush()
