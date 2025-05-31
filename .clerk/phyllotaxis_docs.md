


# GEOMETOR • phyllotaxis



## recent logs:


* 22.356 - [Welcome to the GEOMETOR phyllotaxis project](index.html#document-log/22.356-153850)


first log entry




## contents




### Mission



* [goals](#goals)



Summary



#### goals


* 22.356 - [Welcome to the GEOMETOR phyllotaxis project](index.html#document-log/22.356-153850)


first log entry





### usage


In this simple example, we create the classic *vesica pisces*



```
from geometor.model import \*

model = Model("vesica")
A = model.set\_point(0, 0, classes=["given"])
B = model.set\_point(1, 0, classes=["given"])

model.construct\_line(A, B)

model.construct\_circle(A, B)
model.construct\_circle(B, A)

E = model.get\_element\_by\_label("E")
F = model.get\_element\_by\_label("F")

model.set\_polygon([A, B, E])
model.set\_polygon([A, B, F])

model.construct\_line(E, F)

report\_summary(model)
report\_group\_by\_type(model)
report\_sequence(model)

model.save("vesica.json")

```




### phyllotaxis




#### phyllotaxis package



##### Module contents







### demos




### refs






## indices


* [Index](genindex.html)
* [Module Index](py-modindex.html)
* [Search Page](search.html)







