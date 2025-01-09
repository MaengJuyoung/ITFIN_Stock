
tab1 = class tab1 extends AView
{
	constructor()
	{
		super()
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        this.data = this.getContainerView().data;
        this.pageNo = 1;
        this.numOfRows.selectItemByValue(100);
	}

	onInitDone()
	{
		super.onInitDone()
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)
	}

    // 조회 날짜, 조회 개수 변경 시 
    onChange(comp, info, e)
	{
        this.pageNo = 0;
        this.contiKey.element.style.display = 'block';
	}

    // 조회 버튼 클릭 시 
	onTabBtnClick(comp, info, e)
	{
        const thisObj = this;     
        thisObj.pageNo = 1;
        thisObj.contiKey.element.style.display = 'block';
        thisObj.getItemInfo(thisObj.beginBasDt.getSelectValue(), thisObj.numOfRows.getSelectedItemValue())
	}

    // 다음 버튼 클릭 시 
    onContiKeyClick(comp, info, e)
	{
        let pageNo = ++this.pageNo;
        this.getItemInfo(this.beginBasDt.getSelectValue(), this.numOfRows.getSelectedItemValue(), pageNo)
	}

    // API 통신 로직
    getItemInfo(beginBasDt='', numOfRows='', pageNo='1'){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        const searchType = thisObj.getContainerView().data.searchType;
        const searchText = thisObj.getContainerView().data.searchText;

        const today = new Date();
        if (beginBasDt == '0') today.setMonth(today.getMonth() - 3);        // 세 달 전 날짜 계산
        else if (beginBasDt == '1') today.setDate(today.getDate() - 1);     // 하루 전 날짜 계산
        else if (beginBasDt == '2') today.setDate(today.getDate() - 7);     // 일주일 전 날짜 계산
        else if (beginBasDt == '3') today.setMonth(today.getMonth() - 1);   // 한 달 전 날짜 계산
        beginBasDt = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;   

        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=${numOfRows}&pageNo=${pageNo}&resultType=json&beginBasDt=${beginBasDt}`;
        if (searchType == '종목명'){
            url += `&likeItmsNm=${searchText}`;
        }else if (searchType == '종목코드'){
            url += `&likeSrtnCd=${searchText}`;
        }

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                console.log("result=",result.response.body);

                thisObj.data = result.response.body.items.item;
                if (thisObj.data.length < numOfRows || result.response.body.totalCount == numOfRows) thisObj.contiKey.element.style.display = 'none';   // 불러올 데이터가 없으면 다음 버튼 숨기기
                thisObj.addDataAtGrid();
            },
            error: function(error){
                console.error(error);
            }
        })
    }

    // 그리드에 데이터 추가 로직
    addDataAtGrid(){
        const items = this.data;
        if (items){
            if (this.pageNo == 1) this.grid.removeAll();
            for(var i = 0; i < items.length; i++){
                this.grid.addRow([
                    items[i].basDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
                    items[i].itmsNm, items[i].mrktCtg, items[i].isinCd, items[i].corpNm, items[i].crno, items[i].srtnCd
                ])
            }
        }
    }

	

	
}

