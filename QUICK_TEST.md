# 🚀 IMPROVED Pseudocode Test Cases

## ✨ Perbaikan yang Sudah Dilakukan:

1. ✅ **Auto-connect variables** - PROCESS dan PRINT otomatis connect ke variable yang digunakan
2. ✅ **Type support** - DECLARE bisa pakai "as type" (int, float, string, array)
3. ✅ **FOR loop** - Support "FOR i = 0 TO 10" syntax
4. ✅ **WHILE loop** - Support "WHILE condition" syntax
5. ✅ **RETURN** - Support "RETURN value" syntax
6. ✅ **Purple connections** - Variable connections sekarang warna ungu (#8b5cf6)

---

## 🧪 Test Cases (Copy & Paste Langsung!)

### ✅ Test 1: Simple Calculator (IMPROVED!)
**Copy ini:**
```
FUNCTION calculator DECLARE num1 as int DECLARE num2 as int DECLARE result as int READ num1 READ num2 PROCESS result = num1 + num2 PRINT result
```

**Yang Akan Terjadi:**
- Function node: "calculator"
- 3 Variable nodes (num1, num2, result) dengan type "int"
- 2 Input nodes
- 1 Process node dengan **purple connections** ke num1, num2, result
- 1 Output node dengan **purple connection** ke result

---

### ✅ Test 2: With Type Declarations
**Copy ini:**
```
FUNCTION typeTest DECLARE x as float DECLARE name as string DECLARE count as int READ x READ name PROCESS count = 5 PRINT count
```

**Expected:** Variables dengan tipe yang benar (float, string, int)

---

### ✅ Test 3: FOR Loop (NEW!)
**Copy ini:**
```
FUNCTION loopTest DECLARE i as int DECLARE sum as int PROCESS sum = 0 FOR i = 1 TO 10 PROCESS sum = sum + i PRINT sum
```

**Expected:** Loop node dengan counter "i", start=1, end=10

---

### ✅ Test 4: WHILE Loop (NEW!)
**Copy ini:**
```
FUNCTION whileTest DECLARE count as int PROCESS count = 10 WHILE count > 0 PRINT count PROCESS count = count - 1
```

**Expected:** While loop dengan condition "count > 0"

---

### ✅ Test 5: RETURN Statement (NEW!)
**Copy ini:**
```
FUNCTION add DECLARE x as int DECLARE y as int DECLARE sum as int READ x READ y PROCESS sum = x + y RETURN sum
```

**Expected:** Return node dengan value "sum"

---

### ✅ Test 6: Complex Expression
**Copy ini:**
```
FUNCTION complexCalc DECLARE a as int DECLARE b as int DECLARE c as int DECLARE result as int READ a READ b READ c PROCESS result = a * b + c / 2 - 1 PRINT result
```

**Expected:** Process node connect ke semua variable (a, b, c, result) dengan purple lines

---

### ✅ Test 7: If-Else
**Copy ini:**
```
FUNCTION checkNumber DECLARE x as int READ x IF x > 0 PRINT positive ELSE PRINT negative
```

**Expected:** Condition node dengan true/false branches

---

### ✅ Test 8: Multiple Processes
**Copy ini:**
```
FUNCTION multiStep DECLARE x as int DECLARE y as int DECLARE z as int PROCESS x = 5 PROCESS y = 10 PROCESS z = x * y PRINT z
```

**Expected:** 
- Process 1: x = 5 (connect ke x)
- Process 2: y = 10 (connect ke y)
- Process 3: z = x * y (connect ke x, y, z)
- Print z (connect ke z)

---

### ✅ Test 9: Array Declaration (NEW!)
**Copy ini:**
```
FUNCTION arrayTest DECLARE arr as array DECLARE i as int FOR i = 0 TO 5 PRINT i
```

**Expected:** Variable "arr" dengan type "array"

---

### ✅ Test 10: Constant Value
**Copy ini:**
```
FUNCTION useConst CONST pi = 3.14 DECLARE radius as float DECLARE area as float READ radius PROCESS area = pi * radius * radius PRINT area
```

**Expected:** Const node untuk pi, process connect ke pi, radius, area

---

## 🎯 Quick Visual Test (30 detik)

**Paste ini:**
```
FUNCTION test DECLARE x as int READ x PROCESS x = x * 2 PRINT x
```

**Cek apakah:**
1. ✅ Variable x muncul dengan type "int"
2. ✅ Process node punya **purple line** ke variable x
3. ✅ Print node punya **purple line** ke variable x
4. ✅ Tidak ada overlap

---

## 📊 Expected Code Output

### Test 1 - Python:
```python
def calculator():
    num1 = 0  # int
    num2 = 0  # int
    result = 0  # int
    num1 = input()
    num2 = input()
    result = num1 + num2
    print(result)
```

### Test 3 - Python (FOR Loop):
```python
def loopTest():
    i = 0  # int
    sum = 0  # int
    sum = 0
    for i in range(1, 10):
        sum = sum + i
    print(sum)
```

### Test 5 - Python (RETURN):
```python
def add():
    x = 0  # int
    y = 0  # int
    sum = 0  # int
    x = input()
    y = input()
    sum = x + y
    return sum
```

---

## ✅ Success Checklist

**Pseudocode → Flow:**
- [ ] Semua nodes muncul
- [ ] Variable nodes punya type yang benar
- [ ] **Purple connections** dari variable ke process/output
- [ ] FOR loop punya counter variable
- [ ] WHILE loop punya condition
- [ ] RETURN punya value
- [ ] Tidak ada overlap

**Flow → Code:**
- [ ] Python: indentasi 4 spaces, syntax benar
- [ ] C++: ada includes, closing braces benar
- [ ] JavaScript: let/const, syntax benar
- [ ] Semua bahasa: variable types digunakan
- [ ] Loops: counter variables benar
- [ ] Expressions: operator precedence benar

---

## 🐛 Known Limitations

1. **Nested loops** - Belum support loop di dalam loop
2. **Array operations** - arr[i] belum fully supported di parser
3. **Function parameters** - Belum extract dari FUNCTION line

---

## 🎉 Test Sekarang!

1. Buka http://localhost:5173
2. Copy salah satu test case
3. Paste ke input box
4. Klik → (arrow)
5. **Lihat purple connections!** 💜
6. Klik "Generate Code"
7. Test semua bahasa

**Jika purple connections muncul dan code ter-generate dengan benar, berarti SUKSES!** ✨
