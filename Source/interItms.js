
interItms = class interItms extends AView
{
	constructor()
	{
		super()
        this.data = null; 
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        this.interGrpSelectBox();
        
	}

	onInitDone()
	{
		super.onInitDone()
        this.data = this.getContainer().data;

        this.itmsNm.setText(this.data.itmsNm);
        this.mrktCtg.setText(this.data.mrktCtg);
        this.srtnCd.setText(this.data.srtnCd);
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

	}

    // MY STOCK '닫기' 버튼 클릭 시 
	onCloseBtnClick(comp, info, e)
	{
        this.getContainer().close();
	}

    // MY STOCK '확인' 버튼 클릭 시 
    onAddBtnClick(comp, info, e)
    {
        const thisObj = this;
        const myStock = JSON.parse(localStorage.getItem('myStock'));

        // 선택된 그룹의 인덱스 가져오기
        const index = thisObj.interGrp.getSelectedIndex();
        const group = myStock[index].interItms;

        
        if (group.includes(this.data.itmsNm)) {  // 이미 저장되어 있는지 확인
            return thisObj.showToast("이미 관심 종목에 추가되어 있습니다.");
        }

        group.push({srtnCd : this.data.srtnCd, itmsNm :this.data.itmsNm, mrktCtg :this.data.mrktCtg });

        // 업데이트된 데이터를 다시 저장
        localStorage.setItem("myStock", JSON.stringify(myStock));
        thisObj.showToast("관심 종목에 추가되었습니다!");
        this.getContainer().close(1);
    }

    // '그룹 추가' 버튼, 그룹 추가 '취소' 버튼 클릭 시 
	onAddGroupBtnClick(comp, info, e)
	{
        const buttonName = e.target.innerText;  // 버튼 이름 가져오기

        if (buttonName === '그룹 추가') {       // 그룹 추가 로직
            this.addGroupView.element.style.display = 'block';
            this.groupTextField.setFocus();
        } else if (buttonName === '취소') {     // 그룹 추가 취소 로직
            this.addGroupView.element.style.display = 'none';
        }
	}

    // 그룹 이름 입력 후 엔터 클릭 시 
    onGroupTextFieldKeyup(comp, info, e)
	{
        if ( e.key === 'Enter' ) this.onGroupAddBtnClick();
	}

    // 그룹 추가 '확인' 버튼 클릭 시 
    onGroupAddBtnClick(comp, info, e) { 
        const thisObj = this;
        const groupName = thisObj.groupTextField.getText().trim(); // 공백 제거

        if (!groupName) {
            thisObj.showToast('그룹 이름을 입력하세요.');
            thisObj.groupTextField.setFocus();
            return;
        }

        const myStock = JSON.parse(localStorage.getItem('myStock'));

        // 그룹 이름 중복 확인
        const isDuplicate = myStock.some(grp => grp.interGrp === groupName);
        if (isDuplicate) {
            thisObj.showToast("중복된 그룹 이름입니다. 다른 이름을 입력하세요."); 
            thisObj.groupTextField.setFocus();
            return;
        }

        // 새로운 그룹 추가
        myStock.push({ interGrp: groupName, interItms: [] });
        thisObj.groupTextField.setText(""); // 입력 필드 초기화
        thisObj.addGroupView.element.style.display = 'none';

        localStorage.setItem("myStock", JSON.stringify(myStock)); // 로컬 스토리지에 저장
        this.interGrpSelectBox(); // 그룹 리스트 갱신
        thisObj.showToast("새로운 그룹이 추가되었습니다.");
    }

    // 그룹 추가 시 셀렉트 박스에 데이터 추가하는 로직
    interGrpSelectBox(){
        const myStock = JSON.parse(localStorage.getItem('myStock'));
        this.interGrp.removeAll();
        myStock.forEach(interGrps => {
            this.interGrp.addItem(interGrps.interGrp);
        })
    }

    // 토스트 보여주는 로직
    showToast(message){
        AToast.single();
        AToast.show(`${message}`);
    }
}

