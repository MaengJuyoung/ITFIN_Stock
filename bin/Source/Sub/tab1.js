
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
        this.label.element.style.display = 'none';
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
        this.pageNo = 0;                // pageNo 초기화 
        this.contiKey.element.style.display = 'block';
	}

    // 조회 버튼 클릭 시 
	onTabBtnClick(comp, info, e)
	{
        const thisObj = this;     
        thisObj.grid.scrollToTop();             // 조회 버튼 클릭 시, 스크롤 맨 위로 이동
        if (thisObj.data.items.length !== 0){   // 검색 데이터가 있을 때
            thisObj.pageNo = 1;                 // pageNo 셋팅
            thisObj.contiKey.element.style.display = 'block';
            thisObj.getItemInfo(thisObj.beginBasDt.getSelectValue(), thisObj.numOfRows.getSelectedItemValue())
        }
	}

    // 다음 버튼 클릭 시 
    onContiKeyClick(comp, info, e)
	{
        const thisObj = this;     
        if (thisObj.pageNo == 0) thisObj.grid.scrollToTop();    // 다음 버튼 처음 클릭 시, 스크롤 맨 위로 이동
        if (thisObj.data.items.length !== 0){                   // 검색 데이터가 있을 때
            let pageNo = ++thisObj.pageNo;                      // pageNo 1씩 증가
            this.getItemInfo(thisObj.beginBasDt.getSelectValue(), thisObj.numOfRows.getSelectedItemValue(), pageNo)
        }
	}

    // 그리드 스크롤 끝까지 내려가면 자동 조회 
	onGridScrollbottom(comp, info, e)
	{
        this.onContiKeyClick();
	}

    // 그리드 선택 시, 선택된 항목의 종목명, 시장구분, 코드 저장하는 로직
	onGridSelect(comp, info, e)
	{
        const thisObj = this;
        const index = thisObj.grid.getRowIndexByInfo(info);
        if (index == -1) return;

        const data = thisObj.grid.getDataByOption(info);
        const interdata = { itmsNm: data[1], mrktCtg: data[2], srtnCd: data[6] }
        this.openDialog(interdata);
	}

    // API 통신 로직
    getItemInfo(beginBasDt='', numOfRows='', pageNo='1'){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        const searchType = thisObj.getContainerView().data.searchType;      // 메인에서 넘어온 검색 구분
        const searchText = thisObj.getContainerView().data.searchText;      // 메인에서 넘어온 검색어

        const today = new Date();
        if (beginBasDt == '0') today.setMonth(today.getMonth() - 3);        // (전체) 세 달 전 날짜 계산
        else if (beginBasDt == '1') today.setDate(today.getDate() - 2);     // 이틀 전 날짜 계산
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
                if (result.response.body.totalCount == 0) {             // 검색 데이터가 없을 때
                    thisObj.label.element.style.display = 'block';
                    thisObj.grid.removeAll();
                } else {                                                // 검색 데이터가 있을 때
                    thisObj.label.element.style.display = 'none';
                    const searchData = result.response.body.items.item;
                    thisObj.addDataAtGrid(searchData);
                    if (searchData.length < numOfRows || result.response.body.totalCount == numOfRows) return thisObj.contiKey.element.style.display = 'none';   // 불러올 데이터가 없으면 다음 버튼 숨기기

                }
            },
            error: function(error){
                console.error(error);
            }
        })
    }

    // 그리드에 데이터 추가 로직
    addDataAtGrid(data){
        const items = data;
        if (items){
            if (this.pageNo == 1) this.grid.removeAll();
            for(var i = 0; i < items.length; i++){
                this.grid.addRow([
                    items[i].basDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),        // 날짜 마스킹 처리하여 그리드 추가 
                    items[i].itmsNm, items[i].mrktCtg, items[i].isinCd, items[i].corpNm, items[i].crno, items[i].srtnCd
                ])
            }
        }
    }

    // 관심종목 추가 창 열기
    openDialog(data = null) {
        const wnd = new AWindow(`관심종목`);
        wnd.setWindowOption({ 
            isCenter : false,           //화면 가운데 위치 여부 
            isFocusLostClose : true,    //윈도우 밖의 화면 클릭시 닫히는 여부 
            isDraggable: true,          //윈도우 창을 드래그로 움직이게 할지
        }); 
        wnd.openAsDialog('Source/Sub/interItms.lay', this.getContainer());

        wnd.setData(data);
        wnd.setResultCallback(result => {
            if (result) {
                console.log("result=",result)
            }
        });
    }
}

