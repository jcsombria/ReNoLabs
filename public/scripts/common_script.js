var _isEPub = false;

var __base64Images = [];
__base64Images["/org/opensourcephysics/resources/controls/images/reset2.gif"]="data:image/gif;base64,R0lGODlhEAAQAIcAAAAAAAAAMwAAZgAAmQAAzAAA/wAzAAAzMwAzZgAzmQAzzAAz/wBmAABmMwBmZgBmmQBmzABm/wCZAACZMwCZZgCZmQCZzACZ/wDMAADMMwDMZgDMmQDMzADM/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMzADMzMzMzZjMzmTMzzDMz/zNmADNmMzNmZjNmmTNmzDNm/zOZADOZMzOZZjOZmTOZzDOZ/zPMADPMMzPMZjPMmTPMzDPM/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YzAGYzM2YzZmYzmWYzzGYz/2ZmAGZmM2ZmZmZmmWZmzGZm/2aZAGaZM2aZZmaZmWaZzGaZ/2bMAGbMM2bMZmbMmWbMzGbM/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5kzAJkzM5kzZpkzmZkzzJkz/5lmAJlmM5lmZplmmZlmzJlm/5mZAJmZM5mZZpmZmZmZzJmZ/5nMAJnMM5nMZpnMmZnMzJnM/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wzAMwzM8wzZswzmcwzzMwz/8xmAMxmM8xmZsxmmcxmzMxm/8yZAMyZM8yZZsyZmcyZzMyZ/8zMAMzMM8zMZszMmczMzMzM/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8zAP8zM/8zZv8zmf8zzP8z//9mAP9mM/9mZv9mmf9mzP9m//+ZAP+ZM/+ZZv+Zmf+ZzP+Z///MAP/MM//MZv/Mmf/MzP/M////AP//M///Zv//mf//zP///8DAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAANgALAAAAAAQABAAAAhmALEJHEhGh44CAxMSNKgDG4qHCgUWRDiwAESBDA1aLEDR4oCBDDeiGPjwY0UdKCwmRDHAZEWVEWNSTNgwZsSDMwVyzIlyY8KdIFMKnQkUG06hLV0W1dlSJkdsFlna1Mlx5NSrAgMCADs=";
__base64Images["/org/opensourcephysics/resources/controls/images/reset.gif"]="data:image/gif;base64,R0lGODlhEAAQAIcAAAAAAAAAMwAAZgAAmQAAzAAA/wAzAAAzMwAzZgAzmQAzzAAz/wBmAABmMwBmZgBmmQBmzABm/wCZAACZMwCZZgCZmQCZzACZ/wDMAADMMwDMZgDMmQDMzADM/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMzADMzMzMzZjMzmTMzzDMz/zNmADNmMzNmZjNmmTNmzDNm/zOZADOZMzOZZjOZmTOZzDOZ/zPMADPMMzPMZjPMmTPMzDPM/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YzAGYzM2YzZmYzmWYzzGYz/2ZmAGZmM2ZmZmZmmWZmzGZm/2aZAGaZM2aZZmaZmWaZzGaZ/2bMAGbMM2bMZmbMmWbMzGbM/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5kzAJkzM5kzZpkzmZkzzJkz/5lmAJlmM5lmZplmmZlmzJlm/5mZAJmZM5mZZpmZmZmZzJmZ/5nMAJnMM5nMZpnMmZnMzJnM/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wzAMwzM8wzZswzmcwzzMwz/8xmAMxmM8xmZsxmmcxmzMxm/8yZAMyZM8yZZsyZmcyZzMyZ/8zMAMzMM8zMZszMmczMzMzM/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8zAP8zM/8zZv8zmf8zzP8z//9mAP9mM/9mZv9mmf9mzP9m//+ZAP+ZM/+ZZv+Zmf+ZzP+Z///MAP/MM//MZv/Mmf/MzP/M////AP//M///Zv//mf//zP///87OzgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAANgALAAAAAAQABAAAAheALEJHMhioMGDAq8URIiQhaCFDAleeRhR4kQWGDMeZHGl48OOICEK5HgxI0aFGy9eW7nSoUhsLq8ZjLmRhUyCD2/O1AkzJ0OeNE0KPWlzJMijIXUOFcoTG8unLA0GBAA7";
__base64Images["/org/opensourcephysics/resources/controls/images/play.gif"]="data:image/gif;base64,R0lGODlhEAAQAKL/AP///5mZzGZmmTMzZgAAAMDAwAAAAAAAACH5BAEAAAUALAAAAAAQABAAQAMsWLrcPkHIAYBTUIzbBrXcMghhF01l9pUFyBbbiwUxm2n2iXL3ytMVW1BWSgAAIf5PQ29weXJpZ2h0IDIwMDAgYnkgU3VuIE1pY3Jvc3lzdGVtcywgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLg0KSkxGIEdSIFZlciAxLjANCgA7";
__base64Images["/org/opensourcephysics/resources/controls/images/power_on.png"]="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAFnRFWHRDcmVhdGlvbiBUaW1lADExLzA1LzA33bqJ2wAAAq1JREFUeJxlk09oVFcUxn/3vskkqZoJGRMXTgQpCga0qZkUChEtFjFg6giuVDAgbaQroV2WGgUXXQiudJlVyDJpKRVKwYR0YXVqtNrUP1SSOMYRJpjJjJn3Zubc08Uzk4n94HDh8N1zzvcdjlFV6rHn75P7oqbhkqc26WET4oTAlTOBq6QDV774oufmX/V8U1+ge/bUuGdsaiHI8kYKCAKAh2UzzcS1hYqrTix8cvPEhgLfZq41TRXuPctVlxNz5cVawVZvCwDLUqjl4rKFZolmtr9t23X78zHfAvy2cmes/nOq9RAAM12jzOwZBbeeW/IKFE0p8W9TdgyA5OyZ3v2zp5V0j5Lu0ZHcT6qqyvTHugZ+3quqqiPZH2u8rVMHte3WgV7ru/KVhSBb6zwYHwhnXaqsO1UNfRrc9gWpyAEAilGfipErttk0dr15p/Fs/BgAFx7+AMBceZG51VDWhRdXQ07HAJQcQUQwFe0yyUdnNO3/A4D2pEPzfvmU/CafWCwGr8vkq0Vi29tY7p4Mnf/1I4g3sDkXISJOeB8GAx945KUIbQDRMLeGkgNA1GGrTl56WAAmC3+GY3YeXyfbMNbkTebuvts/iJOX3qavdh4VdR8GVJgrLzIYH+Dotj7y/gqPK/M02UbOt5/kWuc3oZEz3zEvWaz1UHF/mN3p48mqyt3n5hUAFzu+ZLhz6H+yAIYfX+fSkxvQ3kAkr4iTXqOq7LjTP76Kn1rywm0ctN0Mdw5xaGtvbezhJ9eZyqWhJYLFoL5MuP4HJ4yqcnj6XNPTSOZZ0ZQSyw2rYbvAwYqEL0CjhRYPG4CuSkbnS7v066f+hmNq//2zcZymilGfICKo0ZphxgdbEAQ34fofbDymesSm+/YiellFk1p1CVGHIBkxLu2Mfu+O3H9Yz/8PLFlkbIqvT3MAAAAASUVORK5CYII=";
__base64Images["/org/opensourcephysics/resources/controls/images/power_off.png"]="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAFnRFWHRDcmVhdGlvbiBUaW1lADExLzA1LzA33bqJ2wAAAsFJREFUeJxlk09oVFcUxn/3zR9HaoJKgphMFGtCrH9alUTqRgWhJtDFjBRsNybURVWwFCqUUmgyghTcaKlLQXeiopOVIEhtNaDjaNVYiNXYjHGeDmhokpcw89677x4XL5lM7AeXezn3O98957scJSLU4unBzz+2PliSUdF4h0RjSaN9ghmnqGem75mZqb5PLuaGavmqVuD50a+yKhpPTT/K4dqjiO+FpGiMSMNKrJa1GLc8sPXC7fQCgUrhaeL1mRPPKoV/ks79wapgpG4pAIEzUY1ZLa2Y+uXFYMO2tu2Z3yoWgH2673xt8rLdKQA2Zh+wMfuAQOZj5uUIMl5Kcvf6eQD+/enrzuc/7JfcOiS3Dnlz5ayIiFxrQ+ZwZnV4ti+frfIGP2uXm7tbOy3tTByffpSrvtyQ7gVgxJ03yp21qWlvL/7OsBJrvIS45eNWpH75etceBaAh3QPAYOa7MNEu4BQLAIz9Esaa0j1MBGCVHbRlrbeMMc1zbs/1+eTSOVri8Hd6MwPdm1mk4E32HABr9qR4q0EZQ6B1c9Ron/ehlKIhAoEzSasACQBVvZ8Iwt34Gst4rq2iMQCm7v4BQPsXPfNfqcLVONuefSfkiFIY7dmRb9oau0TrtWZ6Etcu0JjuZdWuLqYmJzGjT7AWJVjx5UFW/XgKgN+/74XXL6iLxwkCk1NDB7o6As/Ne/kboZGH+/jwSP//2gLIn+wnfypDewL8+GK0DjqViPDXvu1Z89/blHk5AoC3ZSdrvu2n+dNd1bLzJ/t5dedPmmJQn4jjBjLQPeyllYjw8NdMwrt19ZmMl5KqNAaAY+CVD86sYXURaIqBisUpB1Icq5i2Q6O6smCYbnd/lDVGUtZ4CavsoIypGuZZMWZUBNF6oHvYWzhMtRjc0bLJoI4FYjq0MUnja/DdItq/h/Z/3jPsP67lvwOjGG1S8vVScQAAAABJRU5ErkJggg==";
__base64Images["/org/opensourcephysics/resources/controls/images/pause.gif"]="data:image/gif;base64,R0lGODlhEAAQAKL/AP///5mZzGZmmTMzZgAAAMDAwAAAAAAAACH5BAEAAAUALAAAAAAQABAAQAMyWLrcPEEABaWrs+ArrO7ZMwzLSF5RtjXr6rxwjAZqQKOeW6YUz/q6Xs7XABgXxpDMkQAAIf5PQ29weXJpZ2h0IDIwMDAgYnkgU3VuIE1pY3Jvc3lzdGVtcywgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLg0KSkxGIEdSIFZlciAxLjANCgA7";
