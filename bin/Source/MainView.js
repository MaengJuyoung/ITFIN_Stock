
MainView = class MainView extends AView
{
	constructor()
	{
		super()

		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

		//TODO:edit here
        this.data = ''

	}

	onInitDone()
	{
		super.onInitDone()

		//TODO:edit here
        this.getItemInfo();
        this.tab.selectTabById('home');
        


	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

	}

    getItemInfo(){
        const thisObj = this, 
        serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D', // 일반 인증키
        stdt = '2024',  // 조회시작년도 
        url = 'https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=' + serviceKey + '&numOfRows=100&pageNo=1&resultType=json';

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                thisObj.data = result.response.body.items.item;
                console.log("result=",thisObj.data);
            }
        })
    }



	onTabClick(comp, info, e)
	{
        const thisObj = this;
        const tabId = comp.compId;

        thisObj.tab.selectTabById(tabId);
        console.log("탭 id = ",tabId);


        const tab = this.tab.getSelectedTab();
        

        if (tabId == 'home'){
            const grid = tab.view.grid;
            const items = thisObj.data;
            console.log("items",items)
            for(var i = 0; i < items.length; i++){
                grid.addRow([
                    items[i].basDt,
                    items[i].itmsNm,
                    items[i].mrktCtg,
                    items[i].isinCd,
                    items[i].corpNm,
                    items[i].crno,
                    items[i].srtnCd
                ])
            }
        }

	}


}

