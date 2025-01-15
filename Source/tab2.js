
tab2 = class tab2 extends AView
{
	constructor()
	{
		super()
        this.selectedGrp = {};
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)
	}

	onInitDone()
	{
		super.onInitDone()
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

        this.getInterGrp();

	}

    // localStorage에 있는 관심 그룹 가져오기 
    getInterGrp(){
        const myStock = JSON.parse(localStorage.getItem('myStock'));
        this.grpGrid.removeAll();
        myStock.forEach(gruopData => {
            let data = `${gruopData.interGrp} ( ${gruopData.interItms.length} )`;
            this.grpGrid.addRow([data]);
        })
    }

    // 관심 그룹 선택 시 
	onGrpGridSelect(comp, info, e)
	{
        this.grpName.element.style.display = 'none';

        const index = this.grpGrid.getRowIndexByInfo(info);
        console.log("선택된 index", index);

        const myStock = JSON.parse(localStorage.getItem('myStock'));

        this.selectedGrp = {
            index : index,
            data : myStock[index]
        };      // 선택된 그룹 데이터 : 관심 종목 데이터에 보여주기 위해 전역 변수에 저장

	}

    // 관심 그룹 '추가' 버튼 클릭 시 
	onAddGrpClick(comp, info, e)
	{
        this.grpName.element.style.display = 'block';
        this.groupTextField.setFocus();
	}

    // 관심 그룹 '삭제' 버튼 클릭 시 
	onDeleteGrpClick(comp, info, e)
	{
        const myStock = JSON.parse(localStorage.getItem('myStock'));

        if (myStock.length === 1) return AToast.show('관심 그룹은 최소 1개 이상 존재해야 합니다.');
        if (this.selectedGrp){      // 선택 후 삭제 가능
            AToast.show("삭제 시 해당 그룹의 종목 정보도 함께 삭제됩니다!!!")
            myStock.splice(this.selectedGrp.index, 1);                  // 선택된 그룹의 인덱스를 제거 
            localStorage.setItem("myStock", JSON.stringify(myStock));   // 로컬 스토리지에 저장
            this.getInterGrp();                                         // 그리드 업데이트
        }
	}

    // 관심 그룹 '이름 변경' 버튼 클릭 시 
	onModifyGrpClick(comp, info, e)
	{
        if (this.selectedGrp){
            this.grpName.element.style.display = 'block';
            this.groupTextField.setFocus();
            this.groupTextField.setText(this.selectedGrp.data.interGrp);    // 기존 이름 보여주기
        }
	}

    // 관심 그룹 '확인' or '취소' 버튼 클릭 시 
	onGrpBtnClick(comp, info, e)
	{

		//TODO:edit here

	}
}

