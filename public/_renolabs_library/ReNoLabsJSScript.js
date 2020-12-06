var EJSS_INTERFACE=EJSS_INTERFACE||{};
EJSS_INTERFACE.RENOLABS=EJSS_INTERFACE.RENOLABS||{};

EJSS_INTERFACE.RENOLABS.Constants=EJSS_INTERFACE.RENOLABS.Constants||{};
EJSS_INTERFACE.RENOLABS.Constants.COMBO_SIZE_DIF='6px';

EJSS_INTERFACE.RENOLABS.Images=EJSS_INTERFACE.RENOLABS.Images||{};
EJSS_INTERFACE.RENOLABS.Images.Play='data:image/gif;base64,R0lGODlhEAAQAKL/AP///5mZzGZmmTMzZgAAAMDAwAAAAAAAACH5BAEAAAUALAAAAAAQABAAQAMsWLrcPkHIAYBTUIzbBrXcMghhF01l9pUFyBbbiwUxm2n2iXL3ytMVW1BWSgAAIf5PQ29weXJpZ2h0IDIwMDAgYnkgU3VuIE1pY3Jvc3lzdGVtcywgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLg0KSkxGIEdSIFZlciAxLjANCgA7';
EJSS_INTERFACE.RENOLABS.Images.Pause='data:image/gif;base64,R0lGODlhEAAQAKL/AP///5mZzGZmmTMzZgAAAMDAwAAAAAAAACH5BAEAAAUALAAAAAAQABAAQAMyWLrcPEEABaWrs+ArrO7ZMwzLSF5RtjXr6rxwjAZqQKOeW6YUz/q6Xs7XABgXxpDMkQAAIf5PQ29weXJpZ2h0IDIwMDAgYnkgU3VuIE1pY3Jvc3lzdGVtcywgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLg0KSkxGIEdSIFZlciAxLjANCgA7';
EJSS_INTERFACE.RENOLABS.Images.Reset='data:image/gif;base64,R0lGODlhEAAQAIcAAAAAAAAAMwAAZgAAmQAAzAAA/wAzAAAzMwAzZgAzmQAzzAAz/wBmAABmMwBmZgBmmQBmzABm/wCZAACZMwCZZgCZmQCZzACZ/wDMAADMMwDMZgDMmQDMzADM/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMzADMzMzMzZjMzmTMzzDMz/zNmADNmMzNmZjNmmTNmzDNm/zOZADOZMzOZZjOZmTOZzDOZ/zPMADPMMzPMZjPMmTPMzDPM/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YzAGYzM2YzZmYzmWYzzGYz/2ZmAGZmM2ZmZmZmmWZmzGZm/2aZAGaZM2aZZmaZmWaZzGaZ/2bMAGbMM2bMZmbMmWbMzGbM/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5kzAJkzM5kzZpkzmZkzzJkz/5lmAJlmM5lmZplmmZlmzJlm/5mZAJmZM5mZZpmZmZmZzJmZ/5nMAJnMM5nMZpnMmZnMzJnM/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wzAMwzM8wzZswzmcwzzMwz/8xmAMxmM8xmZsxmmcxmzMxm/8yZAMyZM8yZZsyZmcyZzMyZ/8zMAMzMM8zMZszMmczMzMzM/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8zAP8zM/8zZv8zmf8zzP8z//9mAP9mM/9mZv9mmf9mzP9m//+ZAP+ZM/+ZZv+Zmf+ZzP+Z///MAP/MM//MZv/Mmf/MzP/M////AP//M///Zv//mf//zP///87OzgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAMAANgALAAAAAAQABAAAAheALEJHMhioMGDAq8URIiQhaCFDAleeRhR4kQWGDMeZHGl48OOICEK5HgxI0aFGy9eW7nSoUhsLq8ZjLmRhUyCD2/O1AkzJ0OeNE0KPWlzJMijIXUOFcoTG8unLA0GBAA7';
EJSS_INTERFACE.RENOLABS.Images.Update='data:image/gif;base64,R0lGODlhEAAQAIcAAAAAAAAAMwAAZgAAmQAAzAAA/wAzAAAzMwAzZgAzmQAzzAAz/wBmAABmMwBmZgBmmQBmzABm/wCZAACZMwCZZgCZmQCZzACZ/wDMAADMMwDMZgDMmQDMzADM/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMzADMzMzMzZjMzmTMzzDMz/zNmADNmMzNmZjNmmTNmzDNm/zOZADOZMzOZZjOZmTOZzDOZ/zPMADPMMzPMZjPMmTPMzDPM/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YzAGYzM2YzZmYzmWYzzGYz/2ZmAGZmM2ZmZmZmmWZmzGZm/2aZAGaZM2aZZmaZmWaZzGaZ/2bMAGbMM2bMZmbMmWbMzGbM/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5kzAJkzM5kzZpkzmZkzzJkz/5lmAJlmM5lmZplmmZlmzJlm/5mZAJmZM5mZZpmZmZmZzJmZ/5nMAJnMM5nMZpnMmZnMzJnM/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wzAMwzM8wzZswzmcwzzMwz/8xmAMxmM8xmZsxmmcxmzMxm/8yZAMyZM8yZZsyZmcyZzMyZ/8zMAMzMM8zMZszMmczMzMzM/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8zAP8zM/8zZv8zmf8zzP8z//9mAP9mM/9mZv9mmf9mzP9m//+ZAP+ZM/+ZZv+Zmf+ZzP+Z///MAP/MM//MZv/Mmf/MzP/M////AP//M///Zv//mf//zP///8DAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAANgALAAAAAAQABAAAAhmALEJHEhGh44CAxMSNKgDG4qHCgUWRDiwAESBDA1aLEDR4oCBDDeiGPjwY0UdKCwmRDHAZEWVEWNSTNgwZsSDMwVyzIlyY8KdIFMKnQkUG06hLV0W1dlSJkdsFlna1Mlx5NSrAgMCADs=';
EJSS_INTERFACE.RENOLABS.Images.PowerOn='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAFnRFWHRDcmVhdGlvbiBUaW1lADExLzA1LzA33bqJ2wAAAq1JREFUeJxlk09oVFcUxn/3vskkqZoJGRMXTgQpCga0qZkUChEtFjFg6giuVDAgbaQroV2WGgUXXQiudJlVyDJpKRVKwYR0YXVqtNrUP1SSOMYRJpjJjJn3Zubc08Uzk4n94HDh8N1zzvcdjlFV6rHn75P7oqbhkqc26WET4oTAlTOBq6QDV774oufmX/V8U1+ge/bUuGdsaiHI8kYKCAKAh2UzzcS1hYqrTix8cvPEhgLfZq41TRXuPctVlxNz5cVawVZvCwDLUqjl4rKFZolmtr9t23X78zHfAvy2cmes/nOq9RAAM12jzOwZBbeeW/IKFE0p8W9TdgyA5OyZ3v2zp5V0j5Lu0ZHcT6qqyvTHugZ+3quqqiPZH2u8rVMHte3WgV7ru/KVhSBb6zwYHwhnXaqsO1UNfRrc9gWpyAEAilGfipErttk0dr15p/Fs/BgAFx7+AMBceZG51VDWhRdXQ07HAJQcQUQwFe0yyUdnNO3/A4D2pEPzfvmU/CafWCwGr8vkq0Vi29tY7p4Mnf/1I4g3sDkXISJOeB8GAx945KUIbQDRMLeGkgNA1GGrTl56WAAmC3+GY3YeXyfbMNbkTebuvts/iJOX3qavdh4VdR8GVJgrLzIYH+Dotj7y/gqPK/M02UbOt5/kWuc3oZEz3zEvWaz1UHF/mN3p48mqyt3n5hUAFzu+ZLhz6H+yAIYfX+fSkxvQ3kAkr4iTXqOq7LjTP76Kn1rywm0ctN0Mdw5xaGtvbezhJ9eZyqWhJYLFoL5MuP4HJ4yqcnj6XNPTSOZZ0ZQSyw2rYbvAwYqEL0CjhRYPG4CuSkbnS7v066f+hmNq//2zcZymilGfICKo0ZphxgdbEAQ34fofbDymesSm+/YiellFk1p1CVGHIBkxLu2Mfu+O3H9Yz/8PLFlkbIqvT3MAAAAASUVORK5CYII=';
EJSS_INTERFACE.RENOLABS.Images.PowerOff='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAFnRFWHRDcmVhdGlvbiBUaW1lADExLzA1LzA33bqJ2wAAAsFJREFUeJxlk09oVFcUxn/3zR9HaoJKgphMFGtCrH9alUTqRgWhJtDFjBRsNybURVWwFCqUUmgyghTcaKlLQXeiopOVIEhtNaDjaNVYiNXYjHGeDmhokpcw89677x4XL5lM7AeXezn3O98957scJSLU4unBzz+2PliSUdF4h0RjSaN9ghmnqGem75mZqb5PLuaGavmqVuD50a+yKhpPTT/K4dqjiO+FpGiMSMNKrJa1GLc8sPXC7fQCgUrhaeL1mRPPKoV/ks79wapgpG4pAIEzUY1ZLa2Y+uXFYMO2tu2Z3yoWgH2673xt8rLdKQA2Zh+wMfuAQOZj5uUIMl5Kcvf6eQD+/enrzuc/7JfcOiS3Dnlz5ayIiFxrQ+ZwZnV4ti+frfIGP2uXm7tbOy3tTByffpSrvtyQ7gVgxJ03yp21qWlvL/7OsBJrvIS45eNWpH75etceBaAh3QPAYOa7MNEu4BQLAIz9Esaa0j1MBGCVHbRlrbeMMc1zbs/1+eTSOVri8Hd6MwPdm1mk4E32HABr9qR4q0EZQ6B1c9Ron/ehlKIhAoEzSasACQBVvZ8Iwt34Gst4rq2iMQCm7v4BQPsXPfNfqcLVONuefSfkiFIY7dmRb9oau0TrtWZ6Etcu0JjuZdWuLqYmJzGjT7AWJVjx5UFW/XgKgN+/74XXL6iLxwkCk1NDB7o6As/Ne/kboZGH+/jwSP//2gLIn+wnfypDewL8+GK0DjqViPDXvu1Z89/blHk5AoC3ZSdrvu2n+dNd1bLzJ/t5dedPmmJQn4jjBjLQPeyllYjw8NdMwrt19ZmMl5KqNAaAY+CVD86sYXURaIqBisUpB1Icq5i2Q6O6smCYbnd/lDVGUtZ4CavsoIypGuZZMWZUBNF6oHvYWzhMtRjc0bLJoI4FYjq0MUnja/DdItq/h/Z/3jPsP67lvwOjGG1S8vVScQAAAABJRU5ErkJggg==';
EJSS_INTERFACE.RENOLABS.Images.Main='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAAmlE46AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4ggcDzURfjoWtgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAADkSURBVCjPldJPK0RRFADw30XRTGwsZCON2NpZWHnKkvI1NFtbSyvZWvsGIpT8K2FjYzepabChfAEJ1+a9msybmffOWdzTufe3OecG+XGHx7Sex6KCcdpWn+Q9GOgCvzCHK4yXgfCEBEdl4QwOsVoWNrGGtzKwlZ4bmCw60QeMIrT1bvuhBcz+6+3hPr3LjSouRQ2xIxvpaqp58Nin5RwU3Yg27XR+hmDJRBeU5Ydfw+qCJGMjOBcd9IQvogvPuE6NbU1JT5RlS7RiC7tDGFOzjve+i5rGmYrgO2AfrxgsuOcfTP0Bg6hueTy/SeAAAAAASUVORK5CYII=';
EJSS_INTERFACE.RENOLABS.Images.Private='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAAmlE46AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4ggcDzYvlHZY3gAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAD2SURBVCjPldG7LkRRFAbg77gkIi4TkYhQCFGpRTQ6VBJRaLwAlVKlVol4C2/gARQS5USCjHEpqEaiIa6zFHJiZsw5xp/81V5f1t7Z1Cehcxh7jJeZuMAuyaD8dPTT/cRplYjvFoPe6l/4npv4QWkrgeMslDD7+hulXYja4bZ6O5pzmYHcR1Z4ydiolAeXmWuCpuP7LDfJKq7ZCNYDZSw2TrU3kXf4pNRH8Za3fRziPW/dFkNBqeaaR0FPYCkLbbMZ2d8xHyRrjWiMyRyUtvDR4LoeeW8BngfOUjXPSgso7VQVBTjg+R/wMrCT0HHFzAifWkvg5OELJbvFJll1itwAAAAASUVORK5CYII=';

EJSS_INTERFACE.RENOLABS.LabControl={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('Lab',element.setLab,element.getLab);
    controller.registerProperty('ButtonWidth',element.setButtonWidth,element.getButtonWidth);
    controller.registerProperty('ButtonHeight',element.setButtonHeight,element.getButtonHeight);
  }
};
EJSS_INTERFACE.RENOLABS.labControl=function(mName){
  var self=EJSS_INTERFACE.panel(mName);
  var mLab = {};
  var buttonWidth = '0px';
  var buttonHeight = '0px';

  var b1 = EJSS_INTERFACE.twoStateButton(mName+'_btnPlay');
  var b2 = EJSS_INTERFACE.twoStateButton(mName+'_btnPause');
  var b3 = EJSS_INTERFACE.twoStateButton(mName+'_btnReset');
  var b4 = EJSS_INTERFACE.twoStateButton(mName+'_btnUpdate');
  var b5 = EJSS_INTERFACE.twoStateButton(mName+'_btnPower');
  var b6 = EJSS_INTERFACE.twoStateButton(mName+'_btnVersion');

  b1.setImageUrlOn(EJSS_INTERFACE.RENOLABS.Images.Play);
  b1.setImageUrlOff(EJSS_INTERFACE.RENOLABS.Images.Play);
  b2.setImageUrlOn(EJSS_INTERFACE.RENOLABS.Images.Pause);
  b2.setImageUrlOff(EJSS_INTERFACE.RENOLABS.Images.Pause);
  b3.setImageUrlOn(EJSS_INTERFACE.RENOLABS.Images.Reset);
  b3.setImageUrlOff(EJSS_INTERFACE.RENOLABS.Images.Reset);
  b4.setImageUrlOn(EJSS_INTERFACE.RENOLABS.Images.Update);
  b4.setImageUrlOff(EJSS_INTERFACE.RENOLABS.Images.Update);
  b5.setImageUrlOn(EJSS_INTERFACE.RENOLABS.Images.PowerOn);
  b5.setImageUrlOff(EJSS_INTERFACE.RENOLABS.Images.PowerOff);
  b6.setImageUrlOn(EJSS_INTERFACE.RENOLABS.Images.Main);
  b6.setImageUrlOff(EJSS_INTERFACE.RENOLABS.Images.Private);

  self.appendChild(b1);
  self.appendChild(b2);
  self.appendChild(b3);
  self.appendChild(b4);
  self.appendChild(b5);
  self.appendChild(b6);

  self.setLab=function(lab){
    mLab = lab;
    if (!mLab.socket || mLab.socket.disconnected) {
      b1.setDisabled(true);
      b2.setDisabled(true);
      b3.setDisabled(true);
      b4.setDisabled(true);
      b5.setDisabled(true);
      b6.setDisabled(true);
      return;
    }
    else {
      b4.setDisabled(false);
      b5.setDisabled(false);
      b6.setDisabled(false);
    }
    
    /* Fixed Relations */
    var button_state = null;
    switch (mLab.state_REAL.config) {
      case 0:
        button_state = [0, 0, 0, 0, 1];
        break;
      case 1:
        button_state = [1, 1, 0, 0, 0];
        break;
      case 2:
        button_state = [1, 0, 1, 1, 0];
        break;
      case 3:
        button_state = [1, 1, 0, 1, 0];
        break;
      default:
        break;
    }
    if (button_state) {
      b1.setDisabled(!button_state[1]);
      b2.setDisabled(!button_state[2]);
      b3.setDisabled(!button_state[3]);
      b6.setDisabled(!button_state[4]);
      b5.setState(!button_state[0]);
    }
  };
  self.getLab=function(){
    return mLab;
  };
  self.setButtonWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(buttonWidth==width)return;
    buttonWidth=width;
    b1.getStyle().setWidth(buttonWidth);
    b2.getStyle().setWidth(buttonWidth);
    b3.getStyle().setWidth(buttonWidth);
    b4.getStyle().setWidth(buttonWidth);
    b5.getStyle().setWidth(buttonWidth)
    b6.getStyle().setWidth(buttonWidth)
  };
  self.getButtonWidth=function(){
    return buttonWidth
  };
  self.setButtonHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(buttonHeight==height)return;
    buttonHeight=height;
    b1.getStyle().setHeight(buttonHeight);
    b2.getStyle().setHeight(buttonHeight);
    b3.getStyle().setHeight(buttonHeight);
    b4.getStyle().setHeight(buttonHeight);
    b5.getStyle().setHeight(buttonHeight)
    b6.getStyle().setHeight(buttonHeight)
  };
  self.getButtonHeight=function(){
    return buttonHeight
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(b1,self.getView(),b1.getName());
    EJSS_CORE.promoteToControlElement(b2,self.getView(),b2.getName());
    EJSS_CORE.promoteToControlElement(b3,self.getView(),b3.getName());
    EJSS_CORE.promoteToControlElement(b4,self.getView(),b4.getName());
    EJSS_CORE.promoteToControlElement(b5,self.getView(),b5.getName());
    EJSS_CORE.promoteToControlElement(b6,self.getView(),b6.getName());
    EJSS_INTERFACE.RENOLABS.LabControl.registerProperties(self,controller);

    b1.setAction('OnClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(2) });
    b1.setAction('OffClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(2) });
    b2.setAction('OnClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(3) });
    b2.setAction('OffClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(3) });
    b3.setAction('OnClick', function(_data,_info) {
      if (mLab.send_connect) mLab.send_connect(4);
      setTimeout(function() {
        if (mLab.reset) mLab.reset()
      }, 1000)
    });
    b3.setAction('OffClick', function(_data,_info) {
      if (mLab.send_connect) mLab.send_connect(4);
      if (mLab.reset) mLab.reset()
    });
    b4.setAction('OnClick', function(_data,_info) { if (mLab.update) mLab.update() });
    b4.setAction('OffClick', function(_data,_info) { if (mLab.update) mLab.update() });
    b5.setAction('OnClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(1, b6.getState()); if (mLab.reset) mLab.reset() });
    b5.setAction('OffClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(0) });
  };
  self.setButtonWidth('120px');
  self.setButtonHeight('50px');
  return self
};
EJSS_INTERFACE.RENOLABS.LabParameterHeader={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
  }
};
EJSS_INTERFACE.RENOLABS.labParameterHeader=function(mName){
  var self = EJSS_INTERFACE.panel(mName+'_labels');
  var columnWidth = '0px';
  var rowHeight = '0px';

  var empty_label = EJSS_INTERFACE.imageAndTextButton(mName+'_empty_label');
  var REAL_label = EJSS_INTERFACE.imageAndTextButton(mName+'_REAL_label');
  var EJS_label = EJSS_INTERFACE.imageAndTextButton(mName+'_EJS_label');

  empty_label.setText('');
  empty_label.setDisabled(true);
  empty_label.getStyle().setColor('black');
  empty_label.getStyle().setTextAlign('left');

  REAL_label.setText('REAL');
  REAL_label.setDisabled(true);
  REAL_label.getStyle().setColor('black');
  REAL_label.getStyle().setTextAlign('center');

  EJS_label.setText('EJS');
  EJS_label.setDisabled(true);
  EJS_label.getStyle().setColor('black');
  EJS_label.getStyle().setTextAlign('center');

  self.appendChild(empty_label);
  self.appendChild(REAL_label);
  self.appendChild(EJS_label);

  self.setColumnWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(columnWidth==width)return;
    columnWidth=width;

    empty_label.getStyle().setWidth(columnWidth);
    REAL_label.getStyle().setWidth(columnWidth);
    EJS_label.getStyle().setWidth(columnWidth);
  };
  self.getColumnWidth=function(){
    return columnWidth
  };
  self.setRowHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(rowHeight==height)return;
    rowHeight=height;

    empty_label.getStyle().setHeight(rowHeight);
    REAL_label.getStyle().setHeight(rowHeight);
    EJS_label.getStyle().setHeight(rowHeight);
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(font){
    empty_label.getStyle().setFont(font);
    REAL_label.getStyle().setFont(font);
    EJS_label.getStyle().setFont(font);
  };
  self.registerProperties=function(controller){
    EJSS_INTERFACE.RENOLABS.LabParameterHeader.registerProperties(self,controller);
  };

  return self
};
EJSS_INTERFACE.RENOLABS.LabNumberParameter={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('Title',element.setTitle);
    controller.registerProperty('EjsValue',element.setEjsValue,element.getEjsValue);
    controller.registerAction('OnChange');
  }
};
EJSS_INTERFACE.RENOLABS.labNumberParameter=function(mName){
  var self = EJSS_INTERFACE.panel(mName+'_parameter');
  var columnWidth = '0px';
  var rowHeight = '0px';
  var stored_real_value = 0;
  var stored_ejs_value = 0;

  var title_label = EJSS_INTERFACE.imageAndTextButton(mName+'_title_label');
  var REAL_value = EJSS_INTERFACE.numberField(mName+'_REAL_value');
  var EJS_value = EJSS_INTERFACE.numberField(mName+'_EJS_value');

  title_label.setText('---');
  title_label.setDisabled(true);
  title_label.getStyle().setColor('black');
  title_label.getStyle().setTextAlign('left');

  REAL_value.setFormat("0.00");
  REAL_value.setEditable(false);
  REAL_value.getStyle().setColor('blue');

  EJS_value.setFormat("0.00");
  EJS_value.setEditable(true);
  EJS_value.getStyle().setColor('black');

  self.appendChild(title_label);
  self.appendChild(REAL_value);
  self.appendChild(EJS_value);

  function reportChange() {
    var controller = self.getController();
    if (controller) {
      controller.immediatePropertyChanged('EjsValue');
      controller.invokeImmediateAction("OnChange")
    }
  };

  self.setTitle=function(title){
    title_label.setText(title);
  }
  self.setRealValue=function(value){
    if (stored_real_value !== value) {
      stored_real_value = value;
      REAL_value.setValue(value);
    }
  };
  self.getRealValue=function(){
    return stored_real_value
  };
  self.setEjsValue=function(value){
    if (stored_ejs_value !== value) {
      stored_ejs_value = value;
      EJS_value.setValue(value)
    }
  };
  self.getEjsValue=function(){
    return stored_ejs_value
  };
  self.setEditable=function(value){
    EJS_value.setEditable(value)
  };
  self.getEditable=function(){
    return EJS_value.getEditable();
  };
  self.setColumnWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(columnWidth==width)return;
    columnWidth=width;

    title_label.getStyle().setWidth(columnWidth);
    REAL_value.getStyle().setWidth(columnWidth);
    EJS_value.getStyle().setWidth(columnWidth);
  };
  self.getColumnWidth=function(){
    return columnWidth
  };
  self.setRowHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(rowHeight==height)return;
    rowHeight=height;

    title_label.getStyle().setHeight(rowHeight);
    REAL_value.getStyle().setHeight(rowHeight);
    EJS_value.getStyle().setHeight(rowHeight);
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(font){
    title_label.getStyle().setFont(font);
    REAL_value.getStyle().setFont(font);
    EJS_value.getStyle().setFont(font);
  };
  self.updateEjsBackgroundColor=function() {
    if (self.getRealValue() !== stored_ejs_value)
      EJS_value.getStyle().setBackgroundColor("Yellow")
    else
      EJS_value.getStyle().setBackgroundColor("White")
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(EJS_value,self.getView(),EJS_value.getName());
    EJSS_INTERFACE.RENOLABS.LabNumberParameter.registerProperties(self,controller);

    EJS_value.linkProperty("Value",
      function() {
        return stored_ejs_value
      },
      function(_v) {
        if (stored_ejs_value !== _v) {
          stored_ejs_value = _v;
          reportChange()
        }
      });
  };

  return self
};
EJSS_INTERFACE.RENOLABS.LabOptionsParameter={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('Title',element.setTitle);
    controller.registerProperty('EjsValue',element.setEjsValue,element.getEjsValue);
    controller.registerAction('OnChange');
  }
};
EJSS_INTERFACE.RENOLABS.labOptionsParameter=function(mName){
  var self = EJSS_INTERFACE.panel(mName+'_parameter');
  var columnWidth = '0px';
  var rowHeight = '0px';
  var stored_real_value = 0;
  var stored_ejs_value = 0;
  var mOptionList = ['---'];

  var title_label = EJSS_INTERFACE.imageAndTextButton(mName+'_title_label');
  var REAL_value = EJSS_INTERFACE.textField(mName+'_REAL_value');
  var EJS_value = EJSS_INTERFACE.comboBox(mName+'_EJS_value');

  title_label.setText('---');
  title_label.setDisabled(true);
  title_label.getStyle().setColor('black');
  title_label.getStyle().setTextAlign('left');

  REAL_value.setEditable(false);
  REAL_value.getStyle().setColor('blue');

  if (mOptionList)
    EJS_value.setOptions(mOptionList);
  EJS_value.getStyle().setDisplay('inline');
  REAL_value.setValue(mOptionList[stored_real_value]);

  self.appendChild(title_label);
  self.appendChild(REAL_value);
  self.appendChild(EJS_value);

  function reportChange() {
    var controller = self.getController();
    if (controller) {
      controller.immediatePropertyChanged('EjsValue');
      controller.invokeImmediateAction("OnChange")
    }
  };

  self.setTitle=function(title){
    title_label.setText(title);
  };
  self.setOptions=function(value){
    mOptionList = value;
    EJS_value.setOptions(value);
    if (stored_real_value < mOptionList.length)
      REAL_value.setValue(mOptionList[stored_real_value]);
  };
  self.reset=function(){
    stored_ejs_value = 0;
    stored_real_value = 0;
    self.setOptions(['---']);
    EJS_value.setSelectedOptions([mOptionList[stored_ejs_value]]);
    REAL_value.setValue(mOptionList[stored_real_value]);
    self.updateEjsBackgroundColor();
  }
  self.setRealValue=function(value){
    if (stored_real_value !== value) {
      stored_real_value = value;
      REAL_value.setValue(mOptionList[value]);
      self.updateEjsBackgroundColor();
    }
  };
  self.getRealValue=function(){
    return stored_real_value
  };
  self.setEjsValue=function(value){
    if (stored_ejs_value !== value) {
      stored_ejs_value = value;
      EJS_value.setSelectedOptions([mOptionList[value]]);
      self.updateEjsBackgroundColor();
    }
  };
  self.getEjsValue=function(){
    return stored_ejs_value
  };
  self.setDisabled=function(value){
    EJS_value.setDisabled(value)
  };
  self.getDisabled=function(){
    return EJS_value.getDisabled();
  };
  self.setColumnWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(columnWidth==width)return;
    columnWidth=width;
    var comboWidth = parseInt(columnWidth, 10) + parseInt(EJSS_INTERFACE.RENOLABS.Constants.COMBO_SIZE_DIF, 10);

    title_label.getStyle().setWidth(columnWidth);
    REAL_value.getStyle().setWidth(columnWidth);
    EJS_value.getStyle().setWidth(comboWidth + "px");
  };
  self.getColumnWidth=function(){
    return columnWidth
  };
  self.setRowHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(rowHeight==height)return;
    rowHeight=height;
    var comboHeight = parseInt(rowHeight, 10) + parseInt(EJSS_INTERFACE.RENOLABS.Constants.COMBO_SIZE_DIF, 10);

    title_label.getStyle().setHeight(rowHeight);
    REAL_value.getStyle().setHeight(rowHeight);
    EJS_value.getStyle().setHeight(comboHeight + "px");
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(font){
    title_label.getStyle().setFont(font);
    REAL_value.getStyle().setFont(font);
    EJS_value.getStyle().setFont(font);
  };
  self.updateEjsBackgroundColor=function() {
    if (stored_real_value !== stored_ejs_value)
      EJS_value.getStyle().setBackgroundColor("Yellow");
    else
      EJS_value.getStyle().setBackgroundColor("White");
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(EJS_value,self.getView(),EJS_value.getName());
    EJSS_INTERFACE.RENOLABS.LabOptionsParameter.registerProperties(self,controller);

    EJS_value.linkProperty("SelectedOptions",
      function() {
        return [mOptionList[stored_ejs_value]]
      },
      function(_v) {
        for (var i = 0; i < mOptionList.length; i++) {
          if (mOptionList[i] === _v[0]) {
            stored_ejs_value = i;
            break
          }
        }
        EJS_value.setSelectedOptions([mOptionList[stored_ejs_value]]);
        self.updateEjsBackgroundColor();
        reportChange()
      });
  };

  return self
};
EJSS_INTERFACE.RENOLABS.LabFunctionParameter={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('Lab',element.setLab,element.getLab);
    controller.registerProperty('Config',element.setConfig,element.getConfig);
    controller.registerProperty('Width',element.setWidth,element.getWidth);
    controller.registerProperty('Height',element.setHeight,element.getHeight);
    controller.registerProperty('ColumnWidth',element.setColumnWidth,element.getColumnWidth);
    controller.registerProperty('RowHeight',element.setRowHeight,element.getRowHeight);
    controller.registerProperty('Font', element.setControlFont);
  }
};
EJSS_INTERFACE.RENOLABS.labFunctionParameter=function(mName){
  var self=EJSS_INTERFACE.panel(mName);

  var mLab = null;
  var mConfig = undefined;
  var parameters = [];
  var indexes = [];
  var max_parameters = 0;
  var configured = false;
  var storedConfigNo = undefined;
  var storedConfigParameter = undefined;

  var controlWidth = '0px';
  var controlHeight = '0px';
  var columnWidth = '0px';
  var rowHeight = '0px';
  var font = undefined;

  var parTitle = EJSS_INTERFACE.RENOLABS.labParameterHeader(mName+'_titles');

  var parFunction = EJSS_INTERFACE.RENOLABS.labOptionsParameter(mName+'_function');
  parFunction.setTitle('Tipo');
  parFunction.setDisabled(true);

  self.appendChild(parTitle);
  self.appendChild(parFunction);

  function displayFunctionPanel() {
    if (mLab && mLab.config && mConfig) {
      var index = parFunction.getEjsValue();
      indexes = mLab.config[mConfig].options[index].parameter_indexes;

      for (var i = 0; i < indexes.length; i++) {
        parameters[i].getStyle().setVisibility(true);
        parameters[i].setTitle(mLab.config[mConfig].parameter_names[indexes[i]]);
      }
      for (var i = indexes.length; i < max_parameters; i++) {
        parameters[i].getStyle().setVisibility(false);
        parameters[i].setTitle('---');
      }
    }
  }

  function reportChange() {
    var controller = self.getController();
    if (controller) {
      controller.immediatePropertyChanged('Lab')
    }
  };

  function getArrayOfZeros(size) {
    var result = [];
    for (var i = 0; i < size; i++)
      result.push(0);
    return result;
  }

  function setEjsState() {
    for (var i = 0; i < indexes.length; i++) {
      mLab.state_EJS.inputs[mConfig][indexes[i] + 1] = parameters[i].getEjsValue();
    }
    reportChange();
  }

  function configureView() {
    if (!mLab || !mLab.socket || mLab.socket.disconnected || !mLab.config || !mConfig) return;
    if (mLab.configNo !== storedConfigNo || mConfig !== storedConfigParameter) {
      /* Apply remote lab configuration */
      max_parameters = 0;
      var options = [];
      for (var i = 0; i < mLab.config[mConfig].options.length; i++) {
        options.push(mLab.config[mConfig].options[i].name);
        var parNumber = mLab.config[mConfig].options[i].parameter_indexes.length;
        if (max_parameters < parNumber) max_parameters = parNumber;
      }
      parFunction.setOptions(options);

      if (!mLab.state_EJS.inputs[mConfig])
        mLab.state_EJS.inputs[mConfig] = getArrayOfZeros(mLab.config[mConfig].parameter_names.length + 1);
      if (!mLab.state_REAL.inputs[mConfig])
        mLab.state_REAL.inputs[mConfig] = getArrayOfZeros(mLab.config[mConfig].parameter_names.length + 1);

      /* Create the maximum number of parameters that can be displayed */
      for (var i = 0; i < max_parameters; i++) {
        if (i < parameters.length) {
          parameters[i].getStyle().setDisplay('block');
          parameters[i].getStyle().setVisibility(false);
          continue;
        }

        var control = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_par_'+i, '---');
        parameters.push(control);

        /* Inherit sizes and fonts */
        control.setColumnWidth(columnWidth);
        control.setRowHeight(rowHeight);
        if (font) control.setControlFont(font);

        /* Initially not visible */
        control.getStyle().setDisplay('block');
        control.getStyle().setVisibility(false);

        EJSS_CORE.promoteToControlElement(control,self.getView(),control.getName());
        control.setAction("OnChange", setEjsState);
        self.appendChild(control);
      }

      for (var i = max_parameters; i < parameters.length; i++) {
        parameters[i].getStyle().setDisplay('none');
        parameters[i].getStyle().setVisibility(false);
      }

      storedConfigNo = mLab.configNo;
      storedConfigParameter = mConfig;
      configured = true;
    }
  }

  self.setLab=function(lab){
    mLab = lab;

    /* Criteria for reseting the panel */
    if (!mLab || !mLab.socket || mLab.socket.disconnected || !mLab.config || !mConfig) {
      if (configured) {
        parFunction.reset();
        parFunction.setDisabled(true);
        for (var i = 0; i < parameters.length; i++){
          parameters[i].getStyle().setDisplay('none');
          parameters[i].getStyle().setVisibility(false);
          parameters[i].setTitle('---');
          parameters[i].setEditable(false);
        }
        mLab.state_EJS.inputs = {};
        mLab.state_REAL.inputs = {};
        configured = false;
      }
      return;
    }

    if (mLab.configNo !== storedConfigNo || mConfig !== storedConfigParameter)
      configured = false;

    if (!configured)
      configureView();

    if (!configured) {
      mLab.state_EJS.inputs[mConfig][0] = 0;
      parFunction.setEjsValue(mLab.state_EJS.inputs[mConfig][0]);
      return;
    }

    parFunction.setDisabled(false);
    for (var i = 0; i < parameters.length; i++)
      parameters[i].setEditable(true);
    
    /* Fixed Relations */
    parFunction.setEjsValue(mLab.state_EJS.inputs[mConfig][0]);
    displayFunctionPanel();

    for (var i = 0; i < indexes.length; i++) {
      parameters[i].setEjsValue(mLab.state_EJS.inputs[mConfig][indexes[i] + 1]);
    }

    parFunction.setRealValue(mLab.state_REAL.inputs[mConfig][0]);
    for (var i = 0; i < indexes.length; i++) {
      parameters[i].setRealValue(mLab.state_REAL.inputs[mConfig][indexes[i] + 1]);
      parameters[i].updateEjsBackgroundColor();
    }
  };
  self.getLab=function(){
    return mLab;
  };
  self.setConfig=function(config){
    if (config !== mConfig) {
      mConfig = config;
    }
  };
  self.getConfig=function(){
    return mConfig;
  };
  self.setWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(controlWidth==width)return;
    controlWidth=width;
    self.getStyle().setWidth(controlWidth);
  };
  self.setHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(controlHeight==height)return;
    controlHeight=height;
    self.getStyle().setHeight(controlHeight);
  };
  self.setColumnWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(columnWidth==width)return;
    columnWidth=width;

    parTitle.setColumnWidth(columnWidth);

    parFunction.setColumnWidth(columnWidth);
    for (var i = 0; i < indexes.length; i++) {
      parameters[i].setColumnWidth(columnWidth);
    }
  };
  self.getColumnWidth=function(){
    return columnWidth
  };
  self.setRowHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(rowHeight==height)return;
    rowHeight=height;

    parTitle.setRowHeight(rowHeight);

    parFunction.setRowHeight(rowHeight);
    for (var i = 0; i < indexes.length; i++) {
      parameters[i].setRowHeight(rowHeight);
    }
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(_font){
    font = _font;
    parTitle.setControlFont(font);

    parFunction.setControlFont(font);
    for (var i = 0; i < indexes.length; i++) {
      parameters[i][j].setControlFont(font);
    }
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(parFunction,self.getView(),parFunction.getName());
    EJSS_INTERFACE.RENOLABS.LabFunctionParameter.registerProperties(self,controller);

    parFunction.linkProperty("EjsValue",
      function() { if (mLab && mConfig && mLab.state_EJS.inputs[mConfig]) return mLab.state_EJS.inputs[mConfig][0]; return 0; },
      function(_v) {
        if (mLab && mConfig && mLab.state_EJS.inputs[mConfig]) {
          mLab.state_EJS.inputs[mConfig][0] = _v;

          displayFunctionPanel();
        }
      }
    );
  };
  self.getStyle().setBorderStyle('double');
  self.getStyle().setBorderWidth(5);
  self.getStyle().setBorderColor('DarkGrey');
  self.setColumnWidth('120px');
  self.setRowHeight('50px');
  return self
};
EJSS_INTERFACE.RENOLABS.LabWaveFunctions={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('Lab',element.setLab,element.getLab);
    controller.registerProperty('Width',element.setWidth,element.getWidth);
    controller.registerProperty('Height',element.setHeight,element.getHeight);
    controller.registerProperty('ColumnWidth',element.setColumnWidth,element.getColumnWidth);
    controller.registerProperty('RowHeight',element.setRowHeight,element.getRowHeight);
    controller.registerProperty('Font', element.setControlFont);
  }
};
EJSS_INTERFACE.RENOLABS.labWaveFunctions=function(mName){
  var referenceMode = ['Sin', 'Square', 'Triangular', 'Impulse', 'Step', 'Extern'];
  var self=EJSS_INTERFACE.panel(mName);
  var mLab = null;
  var controlWidth = '0px';
  var controlHeight = '0px';
  var columnWidth = '0px';
  var rowHeight = '0px';

  var parTitle = EJSS_INTERFACE.RENOLABS.labParameterHeader(mName+'_titles');

  var parWave = EJSS_INTERFACE.RENOLABS.labOptionsParameter(mName+'_wave');
  var parAmplitude = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_amplitude', 'Amplitud');
  var parPeriod = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_period', 'Periodo');
  var parOffsetY = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_poffsetY', 'Offset Y');
  var parOffsetT = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_poffsetT', 'Offset T');

  parWave.setTitle('Tipo');
  parWave.setOptions(referenceMode);
  parAmplitude.setTitle('Amplitud');
  parPeriod.setTitle('Periodo');
  parOffsetY.setTitle('Offset Y');
  parOffsetT.setTitle('Offset T');

  self.appendChild(parTitle);
  self.appendChild(parWave);
  self.appendChild(parAmplitude);
  self.appendChild(parPeriod);
  self.appendChild(parOffsetY);
  self.appendChild(parOffsetT);

  function reportChange() {
    var controller = self.getController();
    if (controller) {
      controller.immediatePropertyChanged('Lab')
    }
  };

  self.setLab=function(lab){
    mLab = lab;
    if (!mLab.socket || mLab.socket.disconnected) {
      parWave.setDisabled(true);
      parAmplitude.setEditable(false);
      parPeriod.setEditable(false);
      parOffsetY.setEditable(false);
      parOffsetT.setEditable(false);
      return;
    }
    else {
      parWave.setDisabled(false);
      parAmplitude.setEditable(true);
      parPeriod.setEditable(true);
      parOffsetY.setEditable(true);
      parOffsetT.setEditable(true);
    }
    
    /* Fixed Relations */
    parWave.setRealValue(mLab.state_REAL.reference[0]);
    parAmplitude.setRealValue(mLab.state_REAL.reference[1]);
    parPeriod.setRealValue(mLab.state_REAL.reference[2]);
    parOffsetY.setRealValue(mLab.state_REAL.reference[3]);
    parOffsetT.setRealValue(mLab.state_REAL.reference[4]);

    parWave.setEjsValue(mLab.state_EJS.reference[0]);

    parAmplitude.updateEjsBackgroundColor();
    parPeriod.updateEjsBackgroundColor();
    parOffsetY.updateEjsBackgroundColor();
    parOffsetT.updateEjsBackgroundColor();
  };
  self.getLab=function(){
    return mLab;
  };
  self.setWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(controlWidth==width)return;
    controlWidth=width;
    self.getStyle().setWidth(controlWidth);
  };
  self.setHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(controlHeight==height)return;
    controlHeight=height;
    self.getStyle().setHeight(controlHeight);
  };
  self.setColumnWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(columnWidth==width)return;
    columnWidth=width;

    parTitle.setColumnWidth(columnWidth);

    parWave.setColumnWidth(columnWidth);
    parAmplitude.setColumnWidth(columnWidth);
    parPeriod.setColumnWidth(columnWidth);
    parOffsetY.setColumnWidth(columnWidth);
    parOffsetT.setColumnWidth(columnWidth);
  };
  self.getColumnWidth=function(){
    return columnWidth
  };
  self.setRowHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(rowHeight==height)return;
    rowHeight=height;

    parTitle.setRowHeight(rowHeight);

    parWave.setRowHeight(rowHeight);
    parAmplitude.setRowHeight(rowHeight);
    parPeriod.setRowHeight(rowHeight);
    parOffsetY.setRowHeight(rowHeight);
    parOffsetT.setRowHeight(rowHeight);
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(font){
    parTitle.setControlFont(font);

    parWave.setControlFont(font);
    parAmplitude.setControlFont(font);
    parPeriod.setControlFont(font);
    parOffsetY.setControlFont(font);
    parOffsetT.setControlFont(font);
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(parWave,self.getView(),parWave.getName());
    EJSS_CORE.promoteToControlElement(parAmplitude,self.getView(),parAmplitude.getName());
    EJSS_CORE.promoteToControlElement(parPeriod,self.getView(),parPeriod.getName());
    EJSS_CORE.promoteToControlElement(parOffsetY,self.getView(),parOffsetY.getName());
    EJSS_CORE.promoteToControlElement(parOffsetT,self.getView(),parOffsetT.getName());
    EJSS_INTERFACE.RENOLABS.LabWaveFunctions.registerProperties(self,controller);

    parWave.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.reference[0]; return 0; },
      function(_v) { if (mLab) { mLab.state_EJS.reference[0] = _v; } }
    );
    parAmplitude.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.reference[1]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.reference[1] = _v; } }
    );
    parPeriod.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.reference[2]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.reference[2] = _v; } }
    );
    parOffsetY.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.reference[3]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.reference[3] = _v; } }
    );
    parOffsetT.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.reference[4]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.reference[4] = _v; } }
    );
  };
  self.getStyle().setBorderStyle('double');
  self.getStyle().setBorderWidth(5);
  self.getStyle().setBorderColor('DarkGrey');
  self.setColumnWidth('120px');
  self.setRowHeight('50px');
  return self
};
EJSS_INTERFACE.RENOLABS.LabControllers={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('Lab',element.setLab,element.getLab);
    controller.registerProperty('Width',element.setWidth,element.getWidth);
    controller.registerProperty('Height',element.setHeight,element.getHeight);
    controller.registerProperty('ColumnWidth',element.setColumnWidth,element.getColumnWidth);
    controller.registerProperty('RowHeight',element.setRowHeight,element.getRowHeight);
    controller.registerProperty('Font', element.setControlFont);
  }
};
EJSS_INTERFACE.RENOLABS.labControllers=function(mName){
  var controllerMode = ['Manual', 'PID'];
  var self=EJSS_INTERFACE.panel(mName);
  var mLab = null;
  var controlWidth = '0px';
  var controlHeight = '0px';
  var columnWidth = '0px';
  var rowHeight = '0px';

  var p3 = EJSS_INTERFACE.panel(mName+'_PID');

  var parTitle = EJSS_INTERFACE.RENOLABS.labParameterHeader(mName+'_titles');

  var parController = EJSS_INTERFACE.RENOLABS.labOptionsParameter(mName+'_controller');
  var parKp = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_kp');
  var parKi = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_ki');
  var parKd = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_kd');
  var parN = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_n');
  var parError = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_error');
  
  parController.setTitle('Tipo');
  parController.setOptions(controllerMode);
  parKp.setTitle('Kp');
  parKi.setTitle('Ki');
  parKd.setTitle('Kd');
  parN.setTitle('N');
  parError.setTitle('Error');

  p3.appendChild(parKp);
  p3.appendChild(parKi);
  p3.appendChild(parKd);
  p3.appendChild(parN);
  p3.appendChild(parError);

  self.appendChild(parTitle);
  self.appendChild(parController);
  self.appendChild(p3);

  function displayControllerPanel() {
    var index = parController.getEjsValue();
    if (index === 0)
      p3.getStyle().setVisibility(false);
    else
      p3.getStyle().setVisibility(true);
  };

  function reportChange() {
    var controller = self.getController();
    if (controller) {
      controller.immediatePropertyChanged('Lab')
    }
  };

  self.setLab=function(lab){
    mLab = lab;
    if (!mLab.socket || mLab.socket.disconnected) {
      parController.setDisabled(true);
      parKp.setEditable(false);
      parKi.setEditable(false);
      parKd.setEditable(false);
      parN.setEditable(false);
      parError.setEditable(false);
      return;
    }
    else {
      parController.setDisabled(false);
      parKp.setEditable(true);
      parKi.setEditable(true);
      parKd.setEditable(true);
      parN.setEditable(true);
      parError.setEditable(true);
    }

    /* Fixed Relations */
    parController.setRealValue(mLab.state_REAL.controller[0]);
    parKp.setRealValue(mLab.state_REAL.controller[1]);
    parKi.setRealValue(mLab.state_REAL.controller[2]);
    parKd.setRealValue(mLab.state_REAL.controller[3]);
    parN.setRealValue(mLab.state_REAL.controller[4]);
    parError.setRealValue(mLab.state_REAL.controller[5]);

    parController.setEjsValue(mLab.state_EJS.controller[0]);

    parKp.updateEjsBackgroundColor();
    parKi.updateEjsBackgroundColor();
    parKd.updateEjsBackgroundColor();
    parN.updateEjsBackgroundColor();
    parError.updateEjsBackgroundColor();
  };
  self.getLab=function(){
    return mLab;
  };
  self.setWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(controlWidth==width)return;
    controlWidth=width;
    self.getStyle().setWidth(controlWidth);
  };
  self.setHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(controlHeight==height)return;
    controlHeight=height;
    self.getStyle().setHeight(controlHeight);
  };
  self.setColumnWidth=function(width){
    if(typeof width!=="string")width=width+"px";
    if(columnWidth==width)return;
    columnWidth=width;

    parTitle.setColumnWidth(columnWidth);

    parController.setColumnWidth(columnWidth);
    parKp.setColumnWidth(columnWidth);
    parKi.setColumnWidth(columnWidth);
    parKd.setColumnWidth(columnWidth);
    parN.setColumnWidth(columnWidth);
    parError.setColumnWidth(columnWidth);
  };
  self.getColumnWidth=function(){
    return columnWidth
  };
  self.setRowHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(rowHeight==height)return;
    rowHeight=height;
    var comboHeight = parseInt(rowHeight, 10) + parseInt(EJSS_INTERFACE.RENOLABS.Constants.COMBO_SIZE_DIF, 10);

    parTitle.setRowHeight(rowHeight);

    parController.setRowHeight(rowHeight);
    parKp.setRowHeight(rowHeight);
    parKi.setRowHeight(rowHeight);
    parKd.setRowHeight(rowHeight);
    parN.setRowHeight(rowHeight);
    parError.setRowHeight(rowHeight);
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(font){
    parTitle.setControlFont(font);

    parController.setControlFont(font);
    parKp.setControlFont(font);
    parKi.setControlFont(font);
    parKd.setControlFont(font);
    parN.setControlFont(font);
    parError.setControlFont(font);
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(parController,self.getView(),parController.getName());
    EJSS_CORE.promoteToControlElement(parKp,self.getView(),parKp.getName());
    EJSS_CORE.promoteToControlElement(parKi,self.getView(),parKi.getName());
    EJSS_CORE.promoteToControlElement(parKd,self.getView(),parKd.getName());
    EJSS_CORE.promoteToControlElement(parN,self.getView(),parN.getName());
    EJSS_CORE.promoteToControlElement(parError,self.getView(),parError.getName());
    EJSS_INTERFACE.RENOLABS.LabControllers.registerProperties(self,controller);

    parController.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.controller[0]; return 0; },
      function(_v) {
        if (mLab) {
          mLab.state_EJS.controller[0] = _v;

          displayControllerPanel();
        }
      }
    );
    parKp.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.controller[1]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.controller[1] = _v; } }
    );
    parKi.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.controller[2]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.controller[2] = _v; } }
    );
    parKd.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.controller[3]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.controller[3] = _v; } }
    );
    parN.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.controller[4]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.controller[4] = _v; } }
    );
    parError.linkProperty("EjsValue",
      function() { if (mLab) return mLab.state_EJS.controller[5]; return 0; },
      function(_v) { if (mLab) { self.getLab().state_EJS.controller[5] = _v; } }
    );
  };
  self.getStyle().setBorderStyle('double');
  self.getStyle().setBorderWidth(5);
  self.getStyle().setBorderColor('DarkGrey');
  self.setColumnWidth('120px');
  self.setRowHeight('50px');
  displayControllerPanel();
  return self
};
EJSS_INTERFACE.RENOLABS.LabLogin={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('Labs',element.setLabs,element.getLabs);
    controller.registerProperty('Font', element.setControlFont);
  }
};
EJSS_INTERFACE.RENOLABS.labLogin=function(mName){
  var self = EJSS_INTERFACE.panel(mName+'_parameter');
  var mLabs = null;
  var columnWidth = '0px';
  var rowHeight = '0px';

  var user_label = EJSS_INTERFACE.imageAndTextButton(mName+'_user_label');
  var user_value = EJSS_INTERFACE.textField(mName+'_user_value');
  var pass_label = EJSS_INTERFACE.imageAndTextButton(mName+'_pass_label');
  var pass_value = EJSS_INTERFACE.passwordField(mName+'_pass_value');
  var login_button = EJSS_INTERFACE.twoStateButton(mName+'login_button');

  user_label.setText('User');
  user_label.setDisabled(true);
  user_label.getStyle().setColor('black');
  user_label.getStyle().setTextAlign('left');

  user_value.setEditable(false);
  user_value.getStyle().setColor('blue');

  pass_label.setText('Password');
  pass_label.setDisabled(true);
  pass_label.getStyle().setColor('black');
  pass_label.getStyle().setTextAlign('left');

  pass_value.setEditable(false);
  pass_value.getStyle().setColor('blue');

  login_button.setImageUrlOn(EJSS_INTERFACE.RENOLABS.Images.PowerOn);
  login_button.setImageUrlOff(EJSS_INTERFACE.RENOLABS.Images.PowerOff);
  login_button.setState(1);

  self.appendChild(user_label);
  self.appendChild(user_value);
  self.appendChild(pass_label);
  self.appendChild(pass_value);
  self.appendChild(login_button);

  self.setLabs=function(labs){
    var hasKey = false;
    var isConnected = false;
    if (labs.constructor === Array) {
      mLabs = labs;
    }
    else {
      mLabs = [labs];
    }
    for (var i = 0; i < mLabs.length; i++) {
      if (mLabs[i].key_ejs)
        hasKey = true;
      if (mLabs[i].socket && mLabs[i].socket.connected) {
        isConnected = true;
      }
    }
    if (hasKey)
      self.getStyle().setDisplay('none');
    else
      self.getStyle().setDisplay('');
    if (!isConnected) {
      user_value.setEditable(true);
      pass_value.setEditable(true);
      pass_value.setDisabled(false);
      login_button.setState(1);
    }
    else {
      user_value.setEditable(false);
      pass_value.setEditable(false);
      pass_value.setDisabled(true);
      login_button.setState(0);
    }
  };
  self.getLabs=function(){
    return mLabs;
  };
  self.setControlFont=function(font){
    user_label.getStyle().setFont(font);
    user_value.getStyle().setFont(font);
    pass_label.getStyle().setFont(font);
    pass_value.getStyle().setFont(font);
    login_button.getStyle().setFont(font);
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(login_button,self.getView(),login_button.getName());
    EJSS_INTERFACE.RENOLABS.LabLogin.registerProperties(self,controller);

    login_button.setAction('OnClick',
      function(_data,_info) {
        for (var i = 0; i < mLabs.length; i++) {
          if (mLabs[i]) {
            mLabs[i].user = user_value.getValue();
            mLabs[i].password = pass_value.getValue();
          }
          if (mLabs[i].connect) mLabs[i].connect()
        }
      });

    login_button.setAction('OffClick',
      function(_data,_info) {
        for (var i = 0; i < mLabs.length; i++) {
          if (mLabs[i].disconnect) mLabs[i].disconnect();
        }
      });
  };

  return self
};

