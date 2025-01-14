
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
        if (thisObj.data.items.length === 0) return;    // 검색된 데이터가 없을 때

        thisObj.grid.scrollToTop();                     // 조회 버튼 클릭 시, 스크롤 맨 위로 이동
        thisObj.pageNo = 1;                             // pageNo 셋팅
        thisObj.contiKey.element.style.display = 'block';
        thisObj.getItemInfo(thisObj.beginBasDt.getSelectValue(), thisObj.numOfRows.getSelectedItemValue())
        
	}

    // 다음 버튼 클릭 시 
    onContiKeyClick(comp, info, e)
	{
        const thisObj = this;     
        if (thisObj.data.items.length === 0) return;            // 검색된 데이터가 없을 때

        if (thisObj.pageNo == 0) thisObj.grid.scrollToTop();    // 다음 버튼 처음 클릭 시, 스크롤 맨 위로 이동
        let pageNo = ++thisObj.pageNo;                          // pageNo 1씩 증가
        this.getItemInfo(thisObj.beginBasDt.getSelectValue(), thisObj.numOfRows.getSelectedItemValue(), pageNo)
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
        const formatBeginBasDt = thisObj.formatBasDate(beginBasDt);         // 날짜 포맷

        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=${numOfRows}&pageNo=${pageNo}&resultType=json&beginBasDt=${formatBeginBasDt}`;
        url += (searchType === '종목명') ? `&likeItmsNm=${searchText}` : `&likeSrtnCd=${searchText}`;

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                console.log("result.response.body",result.response.body)
                const searchData = result.response.body.items.item;
                thisObj.updateLabel(result.response.body.totalCount);   // 검색결과에 따라 라벨 처리하는 함수 호출
                thisObj.addDataAtGrid(searchData);
                if (searchData.length < numOfRows || result.response.body.totalCount == numOfRows) {
                    thisObj.contiKey.element.style.display = 'none';   // 불러올 데이터가 없으면 다음 버튼 숨기기
                    //thisObj.getContainer().view.scrollToBottom();
                    // 탭에서 메인으로 스크롤 요청 이벤트 전송
                    const scrollEvent = new CustomEvent('scrollToBottom', {
                        detail: { tab: 'home' }
                    });
                    window.dispatchEvent(scrollEvent);
                }
            },
            error: function(error){
                console.error(error);
            }
        })
    }

    // 날짜 조회 포맷 로직
    formatBasDate(beginBasDt) {
        const today = new Date();
        if (beginBasDt === '0') today.setMonth(today.getMonth() - 3);        // (전체) 세 달 전 날짜 계산
        else if (beginBasDt === '1') today.setDate(today.getDate() - 3);     // 3일 전 날짜 계산
        else if (beginBasDt === '2') today.setDate(today.getDate() - 7);     // 일주일 전 날짜 계산
        else if (beginBasDt === '3') today.setMonth(today.getMonth() - 1);   // 한 달 전 날짜 계산

        return `${today.getFullYear()}${(today.getMonth() + 1)
            .toString()
            .padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    }

    // 라벨 업데이트 로직
    updateLabel(totalCount) {
        const thisObj = this;
        if (totalCount === 0){                              // 특수문자 입력 및 조회 데이터 없을 경우 라벨 표시 
            thisObj.label.element.style.display = 'block';
            thisObj.grid.removeAll();
        } else thisObj.label.element.style.display = 'none'; // 조회 데이터 있을 경우 라벨 없애고 그리드에 데이터 추가
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

    // 관심종목 더보기 클릭 시 
	onMoreBtnClick(comp, info, e)
	{
        const status = e.target.innerText;
        if (status === '더보기') {
            this.group1.element.style.display = 'block';
            this.moreBtn.setText("닫기");
        }else {
            this.group1.element.style.display = 'none';
            this.moreBtn.setText("더보기");
        }

        /* 줄인 코드, 관심 종목 많아지면 보여질 뷰가 많아서 나중에 고려 
        const isMore = e.target.innerText === '더보기';
        this.group1.element.style.display = isMore ? 'block' : 'none';
        this.moreBtn.setText(isMore ? '닫기' : '더보기');
        */

	}
}

