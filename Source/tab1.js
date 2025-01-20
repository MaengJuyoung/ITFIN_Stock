
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
        this.interItms = [];
        this.numOfRows.selectItemByValue(100);
	}

	onInitDone()
	{
		super.onInitDone()
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst);

        // 탭 활성화 시 관심 종목 데이터 로드 및 렌더링
        this.getMyStock();
        this.renderAllStockItems();
        this.group1.element.style.display = 'none';
        this.moreBtn.setText('더보기');
	}

    // 조회 날짜, 조회 개수 변경 시 
    onChange(comp, info, e)
	{
        this.data.pageNo = 0;                           // pageNo 초기화 
        this.contiKey.element.style.display = 'block';
	}

    // 조회 버튼 클릭 시 
	onTabBtnClick(comp, info, e)
	{
        if (this.data.items.length === 0) return;    // 검색된 데이터가 없을 때
        this.data.pageNo = 1;                           // pageNo 초기화 
        this.contiKey.element.style.display = 'block';
        this.getItemInfo(this.beginBasDt.getSelectValue(), this.numOfRows.getSelectedItemValue())
        
	}

    // 다음 버튼 클릭 시 
    onContiKeyClick(comp, info, e)
	{
        if (this.data.items.length === 0) return;   // 검색된 데이터가 없을 때
        const pageNo = ++this.data.pageNo;
        this.getItemInfo(this.beginBasDt.getSelectValue(), this.numOfRows.getSelectedItemValue(), pageNo);
	}

    // 그리드 스크롤 끝까지 내려가면 자동 조회 
	onGridScrollbottom(comp, info, e)
	{
        this.onContiKeyClick();
	}

    // 그리드 선택 시, 선택된 항목의 종목명, 시장구분, 코드 저장하는 로직
	onGridSelect(comp, info, e)
	{
        const index = this.grid.getRowIndexByInfo(info);
        if (index == -1) return;

        const data = this.grid.getDataByOption(info);
        const interdata = { itmsNm: data[1], mrktCtg: data[2], srtnCd: data[6] }
        this.openDialog(interdata);
	}

    // 관심종목 더보기 클릭 시 
	onMoreBtnClick(comp, info, e)
	{
        const isMore = e.target.innerText === '더보기';
        this.group1.element.style.display = isMore ? 'block' : 'none';
        this.moreBtn.setText(isMore ? '닫기' : '더보기');
        this.renderAllStockItems();
	}    

    // API 통신 로직
    getItemInfo(beginBasDt='', numOfRows='', pageNo=1){
        const thisObj = this;
        const serviceKey = 'iLRN%2FNmqT6sKaIKpIX5W2XnVJYAkR2Ygqxhs6ep8RKbiSEa1TLSsmhRhFTp8o3iCCCOvKfJXIva2pRivDOuFuw%3D%3D'; // 일반 인증키
        const { searchType, searchText } = this.data;
        const formatBeginBasDt = thisObj.formatBasDate(beginBasDt);         // 날짜 포맷
        if (pageNo == 1) thisObj.grid.scrollToTop();                        // 첫 페이지 조회 시, 그리드 스크롤 맨 위로 이동


        let url = `https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo?serviceKey=${serviceKey}&numOfRows=${numOfRows}&pageNo=${pageNo}&resultType=json&beginBasDt=${formatBeginBasDt}`;
        url += (searchType === '종목명') ? `&likeItmsNm=${searchText}` : `&likeSrtnCd=${searchText}`;

        $.ajax({
            type: 'GET',
            url: url,
            success: function(result){
                thisObj.grid.showGridMsg(false);
                const { totalCount, items } = result.response.body;

                if (totalCount === 0) {    
                    AToast.show("3일간 조회된 데이터가 없습니다.")
                    thisObj.grid.removeAll();
                    thisObj.grid.showGridMsg(true);
                    return;
                } 
                
                thisObj.addDataAtGrid(items.item);
                if (items.item.length < numOfRows || totalCount == numOfRows) {
                    thisObj.contiKey.element.style.display = 'none';        // 불러올 데이터가 없으면 다음 버튼 숨기기
                    thisObj.dispatchScrollEvent();                          // 탭에서 메인으로 스크롤 요청 이벤트 전송
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

    // 그리드에 데이터 추가 로직
    addDataAtGrid(items){
        if (this.data.pageNo <= 1) this.grid.removeAll();
        items.forEach(item => {
            this.grid.addRow([
                item.basDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
                item.itmsNm, item.mrktCtg, item.isinCd, item.corpNm, item.crno, item.srtnCd
            ]);
        });
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
                this.getMyStock();
                this.renderAllStockItems();
            }
        });
    }

    // localStorage에 있는 관심 종목들만 배열에 저장하는 로직
    getMyStock(){
        const uniqueItems = new Set();
        const myStock = JSON.parse(localStorage.getItem('myStock'));
        myStock.forEach((gruopData) => {
            (gruopData.interItms).forEach(item => uniqueItems.add(item.itmsNm));
        })
        this.interItms = [...uniqueItems];
    }

    // 라벨에 관심 종목 이름 표시하는 로직
    renderAllStockItems() {
        // 그룹의 뷰 가져오기
        const mainGroups = this.group.$ele[0].childNodes;
        const additionalGroups = this.group1.$ele[0].childNodes;

        // 모든 라벨 그룹 초기화, 기존 자식 노드를 새로운 노드로 교체
        [...mainGroups, ...additionalGroups].forEach(group => group.replaceChildren());

        // '더보기' 버튼 처리
        this.moreBtn.element.style.display = this.interItms.length > 5 ? 'block' : 'none';

        // 관심종목 렌더링
        this.interItms.forEach((data, index) => {
            const targetGroup = index < 5 ? mainGroups[index] : additionalGroups[index - 5];
            if (!targetGroup) return;

            // 새 라벨 생성 및 추가
            const label = document.createElement('label');
            label.className = 'ALabel-Style';
            label.style.cssText = `
                width: 100%; 
                height: auto; 
                position: relative; 
                display: block;
            `;
            label.textContent = data; // 종목 이름 설정
            targetGroup.appendChild(label);
        });
    }

    // 스크롤 요청 이벤트 로직
    dispatchScrollEvent(){
        window.dispatchEvent(
            new CustomEvent('scrollToBottom', { 
                detail: { tab: 'home' }
            })
        );
    }
}

