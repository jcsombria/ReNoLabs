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

  self.appendChild(b1);
  self.appendChild(b2);
  self.appendChild(b3);
  self.appendChild(b4);
  self.appendChild(b5);

  self.setLab=function(lab){
    mLab = lab;
    if (!mLab.socket || mLab.socket.disconnected) {
      b1.setDisabled(true);
      b2.setDisabled(true);
      b3.setDisabled(true);
      b4.setDisabled(true);
      b5.setDisabled(true);
      return;
    }
    else {
      b4.setDisabled(false);
      b5.setDisabled(false);
    }
    
    /* Fixed Relations */
    var button_state = null;
    switch (mLab.state_REAL.config) {
      case 0:
        button_state = [0, 0, 0, 0];
        break;
      case 1:
        button_state = [1, 1, 0, 0];
        break;
      case 2:
        button_state = [1, 0, 1, 1];
        break;
      case 3:
        button_state = [1, 1, 0, 1];
        break;
      default:
        break;
    }
    if (button_state) {
      b1.setDisabled(!button_state[1]);
      b2.setDisabled(!button_state[2]);
      b3.setDisabled(!button_state[3]);
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
    b5.setAction('OnClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(1); if (mLab.reset) mLab.reset() });
    b5.setAction('OffClick', function(_data,_info) { if (mLab.send_connect) mLab.send_connect(0) });
  };
  self.setButtonWidth('120px');
  self.setButtonHeight('50px');
  return self
};
EJSS_INTERFACE.RENOLABS.LabParameterHeader={
  registerProperties:function(element,controller){
    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('ColumnWidth',element.setColumnWidth,element.getColumnWidth);
    controller.registerProperty('RowHeight',element.setRowHeight,element.getRowHeight);
    controller.registerProperty('Font', element.setControlFont);
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
/*    EJSS_INTERFACE.Element.registerProperties(element,controller);
    controller.registerProperty('RealValue',element.setRealValue,element.getRealValue);*/
    controller.registerProperty('EjsValue',element.setEjsValue,element.getEjsValue);
/*    controller.registerProperty('Editable',element.setEditable,element.getEditable);
    controller.registerProperty('ColumnWidth',element.setColumnWidth,element.getColumnWidth);
    controller.registerProperty('RowHeight',element.setRowHeight,element.getRowHeight);
    controller.registerProperty('Font', element.setControlFont);*/
  }
};
EJSS_INTERFACE.RENOLABS.labNumberParameter=function(mName, mTitle){
  var self = EJSS_INTERFACE.panel(mName+'_parameter');
  var columnWidth = '0px';
  var rowHeight = '0px';
  var stored_real_value = 0;
/*  var stored_ejs_value = 0;*/

  var title_label = EJSS_INTERFACE.imageAndTextButton(mName+'_title_label');
  var REAL_value = EJSS_INTERFACE.numberField(mName+'_REAL_value');
  var EJS_value = EJSS_INTERFACE.numberField(mName+'_EJS_value');

  title_label.setText(mTitle);
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
      controller.propertiesChanged("EjsValue");
      controller.reportInteractions()
    }
  };

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
/*    if (stored_ejs_value !== value) {
      stored_ejs_value = value;*/
      EJS_value.setValue(value)
/*    }*/
  };
  self.getEjsValue=function(){
    return EJS_value.getValue()
/*    return stored_ejs_value*/
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
    if (self.getRealValue() !== self.getEjsValue())/*stored_ejs_value)*/
      EJS_value.getStyle().setBackgroundColor("Yellow")
    else
      EJS_value.getStyle().setBackgroundColor("White")
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(EJS_value,self.getView(),EJS_value.getName());
    EJSS_INTERFACE.RENOLABS.LabNumberParameter.registerProperties(self,controller);

    EJS_value.linkProperty("Value",
      function() {
        return self.getEjsValue()
      },
      function(_v) {
        if (self.getEjsValue() !== _v) {
          self.setEjsValue(_v);
          reportChange()
        }
      });
/*    EJS_value.setAction('OnChange', function() {
      var value = EJS_value.getValue();
      if (stored_ejs_value !== value){
        stored_ejs_value = value;
/*        EJS_value.getStyle().setBackgroundColor(getColor(stored_real_value, stored_ejs_value));*/
/*        reportChange()
      }
    })*/
  };

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
  var mLab = {};
  var controlWidth = '0px';
  var controlHeight = '0px';
  var columnWidth = '0px';
  var rowHeight = '0px';

  var p1 = EJSS_INTERFACE.panel(mName+'_labels');
  var p2 = EJSS_INTERFACE.panel(mName+'_mode');
  var p3 = EJSS_INTERFACE.panel(mName+'_amplitude');
  var p4 = EJSS_INTERFACE.panel(mName+'_period');
  var p5 = EJSS_INTERFACE.panel(mName+'_offsetY');
  var p6 = EJSS_INTERFACE.panel(mName+'_offsetT');

  var parTitle = EJSS_INTERFACE.RENOLABS.labParameterHeader(mName+'_titles');

  var input_mode = EJSS_INTERFACE.imageAndTextButton(mName+'_input_mode');
  input_mode.setText('Tipo');
  input_mode.setDisabled(true);
  input_mode.getStyle().setColor('black');
  input_mode.getStyle().setTextAlign('left');
  var mode_REAL = EJSS_INTERFACE.textField(mName+'_mode_REAL');
  mode_REAL.setEditable(false);
  mode_REAL.getStyle().setColor('blue');
  var mode_EJS = EJSS_INTERFACE.comboBox(mName+'_mode_EJS');
  mode_EJS.setOptions(referenceMode);
  mode_EJS.getStyle().setDisplay('inline');
  p2.appendChild(input_mode);
  p2.appendChild(mode_REAL);
  p2.appendChild(mode_EJS);

  var parAmplitude = EJSS_INTERFACE.RENOLABS.labNumberParameter(mName+'_amplitude', 'Amplitud');
/*  var amplitude_title = EJSS_INTERFACE.imageAndTextButton(mName+'_amplitude_title');
  amplitude_title.setText('Amplitud');
  amplitude_title.setDisabled(true);
  amplitude_title.getStyle().setColor('black');
  amplitude_title.getStyle().setTextAlign('left');
  var amplitude_REAL = EJSS_INTERFACE.numberField(mName+'_amplitude_REAL');
  amplitude_REAL.setFormat("0.00");
  amplitude_REAL.setEditable(false);
  amplitude_REAL.getStyle().setColor('blue');
  var amplitude_EJS = EJSS_INTERFACE.numberField(mName+'_amplitude_EJS');
  amplitude_EJS.setFormat("0.00");
  amplitude_EJS.setEditable(true);
  amplitude_EJS.getStyle().setColor('black');
  p3.appendChild(amplitude_title);
  p3.appendChild(amplitude_REAL);
  p3.appendChild(amplitude_EJS);*/

  var period_title = EJSS_INTERFACE.imageAndTextButton(mName+'_period_title');
  period_title.setText('Periodo');
  period_title.setDisabled(true);
  period_title.getStyle().setColor('black');
  period_title.getStyle().setTextAlign('left');
  var period_REAL = EJSS_INTERFACE.numberField(mName+'_period_REAL');
  period_REAL.setFormat("0.00");
  period_REAL.setEditable(false);
  period_REAL.getStyle().setColor('blue');
  var period_EJS = EJSS_INTERFACE.numberField(mName+'_period_EJS');
  period_EJS.setFormat("0.00");
  period_EJS.setEditable(true);
  period_EJS.getStyle().setColor('black');
  p4.appendChild(period_title);
  p4.appendChild(period_REAL);
  p4.appendChild(period_EJS);

  var offsetY_title = EJSS_INTERFACE.imageAndTextButton(mName+'_offsetY_title');
  offsetY_title.setText('Offset Y');
  offsetY_title.setDisabled(true);
  offsetY_title.getStyle().setColor('black');
  offsetY_title.getStyle().setTextAlign('left');
  var offsetY_REAL = EJSS_INTERFACE.numberField(mName+'_offsetY_REAL');
  offsetY_REAL.setFormat("0.00");
  offsetY_REAL.setEditable(false);
  offsetY_REAL.getStyle().setColor('blue');
  var offsetY_EJS = EJSS_INTERFACE.numberField(mName+'_offsetY_EJS');
  offsetY_EJS.setFormat("0.00");
  offsetY_EJS.setEditable(true);
  offsetY_EJS.getStyle().setColor('black');
  p5.appendChild(offsetY_title);
  p5.appendChild(offsetY_REAL);
  p5.appendChild(offsetY_EJS);

  var offsetT_title = EJSS_INTERFACE.imageAndTextButton(mName+'_offsetT_title');
  offsetT_title.setText('Offset T');
  offsetT_title.setDisabled(true);
  offsetT_title.getStyle().setColor('black');
  offsetT_title.getStyle().setTextAlign('left');
  var offsetT_REAL = EJSS_INTERFACE.numberField(mName+'_offsetT_REAL');
  offsetT_REAL.setFormat("0.00");
  offsetT_REAL.setEditable(false);
  offsetT_REAL.getStyle().setColor('blue');
  var offsetT_EJS = EJSS_INTERFACE.numberField(mName+'_offsetT_EJS');
  offsetT_EJS.setFormat("0.00");
  offsetT_EJS.setEditable(true);
  offsetT_EJS.getStyle().setColor('black');
  p6.appendChild(offsetT_title);
  p6.appendChild(offsetT_REAL);
  p6.appendChild(offsetT_EJS);

  self.appendChild(parTitle);
  self.appendChild(p2);
  self.appendChild(parAmplitude);
  self.appendChild(p4);
  self.appendChild(p5);
  self.appendChild(p6);

  function getColor(v1, v2) {
    if (v1 !== v2)
      return "Yellow";
    else
      return "White"
  };

  function reportChange() {
    var controller = self.getController();
    if (controller) {
      controller.propertiesChanged("Lab");
      controller.reportInteractions()
    }
  };

  self.setLab=function(lab){
    mLab = lab;
    if (!mLab.socket || mLab.socket.disconnected) {
      mode_EJS.setDisabled(true);
      parAmplitude.setEditable(false);
/*      amplitude_EJS.setEditable(false);*/
      period_EJS.setEditable(false);
      offsetY_EJS.setEditable(false);
      offsetT_EJS.setEditable(false);
      return;
    }
    else {
      mode_EJS.setDisabled(false);
      parAmplitude.setEditable(true);
/*      amplitude_EJS.setEditable(true);*/
      period_EJS.setEditable(true);
      offsetY_EJS.setEditable(true);
      offsetT_EJS.setEditable(true);
    }
    
    /* Fixed Relations */
    if (mode_REAL.getValue() !== referenceMode[mLab.state_REAL.reference[0]]) {
      mode_REAL.setValue(referenceMode[mLab.state_REAL.reference[0]]);
      mode_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[0], mLab.state_EJS.reference[0]));
    }
    parAmplitude.setRealValue(mLab.state_REAL.reference[1]);
/*    amplitude_REAL.setValue(mLab.state_REAL.reference[1]);*/
    period_REAL.setValue(mLab.state_REAL.reference[2]);
    offsetY_REAL.setValue(mLab.state_REAL.reference[3]);
    offsetT_REAL.setValue(mLab.state_REAL.reference[4]);

    var indexes = mode_EJS.getSelectedOptionsIndexes();
    if (indexes.length > 0 && mLab.state_EJS.reference[0] !== indexes[0]){
      mode_EJS.setSelectedOptions([referenceMode[mLab.state_EJS.reference[0]]]);
      mode_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[0], mLab.state_EJS.reference[0]));
    }
    parAmplitude.setEjsValue(mLab.state_EJS.reference[1]);
/*    if (amplitude_EJS.getValue() !== mLab.state_EJS.reference[1]) {
      amplitude_EJS.setValue(mLab.state_EJS.reference[1]);
    }*/
    if (period_EJS.getValue() !== mLab.state_EJS.reference[2]) {
      period_EJS.setValue(mLab.state_EJS.reference[2]);
    }
    if (offsetY_EJS.getValue() !== mLab.state_EJS.reference[3]) {
      offsetY_EJS.setValue(mLab.state_EJS.reference[3]);
    }
    if (offsetT_EJS.getValue() !== mLab.state_EJS.reference[4]) {
      offsetT_EJS.setValue(mLab.state_EJS.reference[4]);
    }

    parAmplitude.updateEjsBackgroundColor();
/*    amplitude_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[1], mLab.state_EJS.reference[1]));*/
    period_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[2], mLab.state_EJS.reference[2]));
    offsetY_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[3], mLab.state_EJS.reference[3]));
    offsetT_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[4], mLab.state_EJS.reference[4]));
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
    var comboWidth = parseInt(columnWidth, 10) + parseInt(EJSS_INTERFACE.RENOLABS.Constants.COMBO_SIZE_DIF, 10);

    parTitle.setColumnWidth(columnWidth);

    input_mode.getStyle().setWidth(columnWidth);
    mode_REAL.getStyle().setWidth(columnWidth);
    mode_EJS.getStyle().setWidth(comboWidth + "px");
    
    parAmplitude.setColumnWidth(columnWidth);
/*    amplitude_title.getStyle().setWidth(columnWidth);
    amplitude_REAL.getStyle().setWidth(columnWidth);
    amplitude_EJS.getStyle().setWidth(columnWidth);*/

    period_title.getStyle().setWidth(columnWidth);
    period_REAL.getStyle().setWidth(columnWidth);
    period_EJS.getStyle().setWidth(columnWidth);

    offsetY_title.getStyle().setWidth(columnWidth);
    offsetY_REAL.getStyle().setWidth(columnWidth);
    offsetY_EJS.getStyle().setWidth(columnWidth);

    offsetT_title.getStyle().setWidth(columnWidth);
    offsetT_REAL.getStyle().setWidth(columnWidth);
    offsetT_EJS.getStyle().setWidth(columnWidth);
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

    input_mode.getStyle().setHeight(rowHeight);
    mode_REAL.getStyle().setHeight(rowHeight);
    mode_EJS.getStyle().setHeight(comboHeight + "px");
    
    parAmplitude.setRowHeight(rowHeight);
/*    amplitude_title.getStyle().setHeight(rowHeight);
    amplitude_REAL.getStyle().setHeight(rowHeight);
    amplitude_EJS.getStyle().setHeight(rowHeight);*/

    period_title.getStyle().setHeight(rowHeight);
    period_REAL.getStyle().setHeight(rowHeight);
    period_EJS.getStyle().setHeight(rowHeight);

    offsetY_title.getStyle().setHeight(rowHeight);
    offsetY_REAL.getStyle().setHeight(rowHeight);
    offsetY_EJS.getStyle().setHeight(rowHeight);

    offsetT_title.getStyle().setHeight(rowHeight);
    offsetT_REAL.getStyle().setHeight(rowHeight);
    offsetT_EJS.getStyle().setHeight(rowHeight);
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(font){
    parTitle.setControlFont(font);

    input_mode.getStyle().setFont(font);
    mode_REAL.getStyle().setFont(font);
    mode_EJS.getStyle().setFont(font);
    
    parAmplitude.setControlFont(font);
/*    amplitude_title.getStyle().setFont(font);
    amplitude_REAL.getStyle().setFont(font);
    amplitude_EJS.getStyle().setFont(font);*/

    period_title.getStyle().setFont(font);
    period_REAL.getStyle().setFont(font);
    period_EJS.getStyle().setFont(font);

    offsetY_title.getStyle().setFont(font);
    offsetY_REAL.getStyle().setFont(font);
    offsetY_EJS.getStyle().setFont(font);

    offsetT_title.getStyle().setFont(font);
    offsetT_REAL.getStyle().setFont(font);
    offsetT_EJS.getStyle().setFont(font);
  };
  self.registerProperties=function(controller){
    EJSS_CORE.promoteToControlElement(mode_EJS,self.getView(),mode_EJS.getName());
    EJSS_CORE.promoteToControlElement(parAmplitude,self.getView(),parAmplitude.getName());
/*    EJSS_CORE.promoteToControlElement(amplitude_EJS,self.getView(),amplitude_EJS.getName());*/
    EJSS_CORE.promoteToControlElement(period_EJS,self.getView(),period_EJS.getName());
    EJSS_CORE.promoteToControlElement(offsetY_EJS,self.getView(),offsetY_EJS.getName());
    EJSS_CORE.promoteToControlElement(offsetT_EJS,self.getView(),offsetT_EJS.getName());
    EJSS_INTERFACE.RENOLABS.LabWaveFunctions.registerProperties(self,controller);

    mode_EJS.setAction('OnChange', function() {
      if (mLab)
        var indexes = mode_EJS.getSelectedOptionsIndexes();
        if (indexes.length > 0 && mLab.state_EJS.reference[0] !== indexes[0]){
          mLab.state_EJS.reference[0] = indexes[0];
          mode_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[0], mLab.state_EJS.reference[0]));
          reportChange()
        }
    });
/*    parAmplitude.linkProperty("EjsValue",
      function() {
        return mLab.state_EJS.reference[1]
      },
      function(_v) {
        mLab.state_EJS.reference[1] = _v;
      } );
/*    amplitude_EJS.setAction('OnChange', function() {
      if (mLab)
        var value = amplitude_EJS.getValue();
        if (mLab.state_EJS.reference[1] !== value){
          mLab.state_EJS.reference[1] = value;
/*          amplitude_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[1], mLab.state_EJS.reference[1]));*/
/*          reportChange()
        }
    })*/
    period_EJS.setAction('OnChange', function() {
      if (mLab)
        var value = period_EJS.getValue();
        if (mLab.state_EJS.reference[2] !== value){
          mLab.state_EJS.reference[2] = value;
/*          period_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[2], mLab.state_EJS.reference[2]));*/
          reportChange()
        }
    });
    offsetY_EJS.setAction('OnChange', function() {
      if (mLab)
        var value = offsetY_EJS.getValue();
        if (mLab.state_EJS.reference[3] !== value){
          mLab.state_EJS.reference[3] = value;
/*          offsetY_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[3], mLab.state_EJS.reference[3]));*/
          reportChange()
        }
    });
    offsetT_EJS.setAction('OnChange', function() {
      if (mLab)
        var value = offsetT_EJS.getValue();
        if (mLab.state_EJS.reference[4] !== value){
          mLab.state_EJS.reference[4] = value;
/*          offsetT_EJS.getStyle().setBackgroundColor(getColor(mLab.state_REAL.reference[4], mLab.state_EJS.reference[4]));*/
          reportChange()
        }
    })
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
  var self=EJSS_INTERFACE.panel(mName);
  var mLab = {};
  var controlWidth = '0px';
  var controlHeight = '0px';
  var columnWidth = '0px';
  var rowHeight = '0px';

  var p1 = EJSS_INTERFACE.panel(mName+'_labels');
  var p2 = EJSS_INTERFACE.panel(mName+'_mode');
  var p3 = EJSS_INTERFACE.panel(mName+'_PID');

  var empty = EJSS_INTERFACE.imageAndTextButton(mName+'_empty');
  empty.setText('');
  empty.setDisabled(true);
  empty.getStyle().setColor('black');
  empty.getStyle().setTextAlign('center');
  var REAL_label_controller = EJSS_INTERFACE.imageAndTextButton(mName+'_REAL_label_controller');
  REAL_label_controller.setText('REAL');
  REAL_label_controller.setDisabled(true);
  REAL_label_controller.getStyle().setColor('black');
  REAL_label_controller.getStyle().setTextAlign('center');
  var EJS_label_controller = EJSS_INTERFACE.imageAndTextButton(mName+'_EJS_label_controller');
  EJS_label_controller.setText('EJS');
  EJS_label_controller.setDisabled(true);
  EJS_label_controller.getStyle().setColor('black');
  EJS_label_controller.getStyle().setTextAlign('center');
  p1.appendChild(empty);
  p1.appendChild(REAL_label_controller);
  p1.appendChild(EJS_label_controller);

  var input_mode = EJSS_INTERFACE.imageAndTextButton(mName+'_input_mode');
  input_mode.setText('Tipo');
  input_mode.setDisabled(true);
  input_mode.getStyle().setColor('black');
  input_mode.getStyle().setTextAlign('left');
  var mode_REAL = EJSS_INTERFACE.textField(mName+'_mode_REAL');
  mode_REAL.setEditable(false);
  mode_REAL.getStyle().setColor('blue');
  var mode_EJS = EJSS_INTERFACE.comboBox(mName+'_mode_EJS');
  mode_EJS.setOptions(['Manual', 'PID']);
  mode_EJS.getStyle().setDisplay('inline');
  p2.appendChild(input_mode);
  p2.appendChild(mode_REAL);
  p2.appendChild(mode_EJS);

  var pPID1 = EJSS_INTERFACE.panel(mName+'_PID_panel_kp');
  var pPID2 = EJSS_INTERFACE.panel(mName+'_PID_panel_ki');
  var pPID3 = EJSS_INTERFACE.panel(mName+'_PID_panel_kd');
  var pPID4 = EJSS_INTERFACE.panel(mName+'_PID_panel_n');
  var pPID5 = EJSS_INTERFACE.panel(mName+'_PID_panel_error');

  var kp_title = EJSS_INTERFACE.imageAndTextButton(mName+'_kp_title');
  kp_title.setText('Kp');
  kp_title.setDisabled(true);
  kp_title.getStyle().setColor('black');
  kp_title.getStyle().setTextAlign('left');
  var kp_REAL = EJSS_INTERFACE.numberField(mName+'_kp_REAL');
  kp_REAL.setFormat("0.00");
  kp_REAL.setEditable(false);
  kp_REAL.getStyle().setColor('blue');
  var kp_EJS = EJSS_INTERFACE.numberField(mName+'_kp_EJS');
  kp_EJS.setFormat("0.00");
  kp_EJS.setEditable(true);
  kp_EJS.getStyle().setColor('black');
  pPID1.appendChild(kp_title);
  pPID1.appendChild(kp_REAL);
  pPID1.appendChild(kp_EJS);
  
  var ki_title = EJSS_INTERFACE.imageAndTextButton(mName+'_ki_title');
  ki_title.setText('Ki');
  ki_title.setDisabled(true);
  ki_title.getStyle().setColor('black');
  ki_title.getStyle().setTextAlign('left');
  var ki_REAL = EJSS_INTERFACE.numberField(mName+'_ki_REAL');
  ki_REAL.setFormat("0.00");
  ki_REAL.setEditable(false);
  ki_REAL.getStyle().setColor('blue');
  var ki_EJS = EJSS_INTERFACE.numberField(mName+'_ki_EJS');
  ki_EJS.setFormat("0.00");
  ki_EJS.setEditable(true);
  ki_EJS.getStyle().setColor('black');
  pPID2.appendChild(ki_title);
  pPID2.appendChild(ki_REAL);
  pPID2.appendChild(ki_EJS);
  
  var kd_title = EJSS_INTERFACE.imageAndTextButton(mName+'_kd_title');
  kd_title.setText('Kd');
  kd_title.setDisabled(true);
  kd_title.getStyle().setColor('black');
  kd_title.getStyle().setTextAlign('left');
  var kd_REAL = EJSS_INTERFACE.numberField(mName+'_kd_REAL');
  kd_REAL.setFormat("0.00");
  kd_REAL.setEditable(false);
  kd_REAL.getStyle().setColor('blue');
  var kd_EJS = EJSS_INTERFACE.numberField(mName+'_kd_EJS');
  kd_EJS.setFormat("0.00");
  kd_EJS.setEditable(true);
  kd_EJS.getStyle().setColor('black');
  pPID3.appendChild(kd_title);
  pPID3.appendChild(kd_REAL);
  pPID3.appendChild(kd_EJS);
  
  var n_title = EJSS_INTERFACE.imageAndTextButton(mName+'_n_title');
  n_title.setText('N');
  n_title.setDisabled(true);
  n_title.getStyle().setColor('black');
  n_title.getStyle().setTextAlign('left');
  var n_REAL = EJSS_INTERFACE.numberField(mName+'_n_REAL');
  n_REAL.setFormat("0.00");
  n_REAL.setEditable(false);
  n_REAL.getStyle().setColor('blue');
  var n_EJS = EJSS_INTERFACE.numberField(mName+'_n_EJS');
  n_EJS.setFormat("0.00");
  n_EJS.setEditable(true);
  n_EJS.getStyle().setColor('black');
  pPID4.appendChild(n_title);
  pPID4.appendChild(n_REAL);
  pPID4.appendChild(n_EJS);
  
  var error_title = EJSS_INTERFACE.imageAndTextButton(mName+'_error_title');
  error_title.setText('Error');
  error_title.setDisabled(true);
  error_title.getStyle().setColor('black');
  error_title.getStyle().setTextAlign('left');
  var error_REAL = EJSS_INTERFACE.numberField(mName+'_error_REAL');
  error_REAL.setFormat("0.00");
  error_REAL.setEditable(false);
  error_REAL.getStyle().setColor('blue');
  var error_EJS = EJSS_INTERFACE.numberField(mName+'_error_EJS');
  error_EJS.setFormat("0.00");
  error_EJS.setEditable(true);
  error_EJS.getStyle().setColor('black');
  pPID5.appendChild(error_title);
  pPID5.appendChild(error_REAL);
  pPID5.appendChild(error_EJS);
  
  p3.appendChild(pPID1);
  p3.appendChild(pPID2);
  p3.appendChild(pPID3);
  p3.appendChild(pPID4);
  p3.appendChild(pPID5);

  self.appendChild(p1);
  self.appendChild(p2);
  self.appendChild(p3);

  self.setLab=function(lab){
    mLab = lab;
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
    var comboWidth = parseInt(columnWidth, 10) + parseInt(EJSS_INTERFACE.RENOLABS.Constants.COMBO_SIZE_DIF, 10);
    empty.getStyle().setWidth(columnWidth);
    REAL_label_controller.getStyle().setWidth(columnWidth);
    EJS_label_controller.getStyle().setWidth(columnWidth);

    input_mode.getStyle().setWidth(columnWidth);
    mode_REAL.getStyle().setWidth(columnWidth);
    mode_EJS.getStyle().setWidth(comboWidth + "px");
    
    kp_title.getStyle().setWidth(columnWidth);
    kp_REAL.getStyle().setWidth(columnWidth);
    kp_EJS.getStyle().setWidth(columnWidth);
    ki_title.getStyle().setWidth(columnWidth);
    ki_REAL.getStyle().setWidth(columnWidth);
    ki_EJS.getStyle().setWidth(columnWidth);
    kd_title.getStyle().setWidth(columnWidth);
    kd_REAL.getStyle().setWidth(columnWidth);
    kd_EJS.getStyle().setWidth(columnWidth);
    n_title.getStyle().setWidth(columnWidth);
    n_REAL.getStyle().setWidth(columnWidth);
    n_EJS.getStyle().setWidth(columnWidth);
    error_title.getStyle().setWidth(columnWidth);
    error_REAL.getStyle().setWidth(columnWidth);
    error_EJS.getStyle().setWidth(columnWidth);
  };
  self.getColumnWidth=function(){
    return columnWidth
  };
  self.setRowHeight=function(height){
    if(typeof height!=="string")height=height+"px";
    if(rowHeight==height)return;
    rowHeight=height;
    var comboHeight = parseInt(rowHeight, 10) + parseInt(EJSS_INTERFACE.RENOLABS.Constants.COMBO_SIZE_DIF, 10);
    empty.getStyle().setHeight(rowHeight);
    REAL_label_controller.getStyle().setHeight(rowHeight);
    EJS_label_controller.getStyle().setHeight(rowHeight);

    input_mode.getStyle().setHeight(rowHeight);
    mode_REAL.getStyle().setHeight(rowHeight);
    mode_EJS.getStyle().setHeight(comboHeight + "px");
    
    kp_title.getStyle().setHeight(rowHeight);
    kp_REAL.getStyle().setHeight(rowHeight);
    kp_EJS.getStyle().setHeight(rowHeight);
    ki_title.getStyle().setHeight(rowHeight);
    ki_REAL.getStyle().setHeight(rowHeight);
    ki_EJS.getStyle().setHeight(rowHeight);
    kd_title.getStyle().setHeight(rowHeight);
    kd_REAL.getStyle().setHeight(rowHeight);
    kd_EJS.getStyle().setHeight(rowHeight);
    n_title.getStyle().setHeight(rowHeight);
    n_REAL.getStyle().setHeight(rowHeight);
    n_EJS.getStyle().setHeight(rowHeight);
    error_title.getStyle().setHeight(rowHeight);
    error_REAL.getStyle().setHeight(rowHeight);
    error_EJS.getStyle().setHeight(rowHeight);
  };
  self.getRowHeight=function(){
    return rowHeight
  };
  self.setControlFont=function(font){
    empty.getStyle().setFont(font);
    REAL_label_controller.getStyle().setFont(font);
    EJS_label_controller.getStyle().setFont(font);

    input_mode.getStyle().setFont(font);
    mode_REAL.getStyle().setFont(font);
    mode_EJS.getStyle().setFont(font);
    
    kp_title.getStyle().setFont(font);
    kp_REAL.getStyle().setFont(font);
    kp_EJS.getStyle().setFont(font);
    ki_title.getStyle().setFont(font);
    ki_REAL.getStyle().setFont(font);
    ki_EJS.getStyle().setFont(font);
    kd_title.getStyle().setFont(font);
    kd_REAL.getStyle().setFont(font);
    kd_EJS.getStyle().setFont(font);
    n_title.getStyle().setFont(font);
    n_REAL.getStyle().setFont(font);
    n_EJS.getStyle().setFont(font);
    error_title.getStyle().setFont(font);
    error_REAL.getStyle().setFont(font);
    error_EJS.getStyle().setFont(font);
  };
  self.registerProperties=function(controller){
    EJSS_INTERFACE.RENOLABS.LabWaveFunctions.registerProperties(self,controller);
  };
  self.getStyle().setBorderStyle('double');
  self.getStyle().setBorderWidth(5);
  self.getStyle().setBorderColor('DarkGrey');
  self.setColumnWidth('120px');
  self.setRowHeight('50px');
  return self
};

