res = "  /**\n  * @swagger\n"

with open("spec.yaml") as f :
    lines = f.readlines()
    for line in lines:
        res += f"  * {line}"

res += "\n  */" 

with open("res.txt", "w") as f: 
    f.write(res)