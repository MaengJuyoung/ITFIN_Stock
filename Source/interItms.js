
interItms = class interItms extends AView
{
	constructor()
	{
		super()
        this.data = null; 
		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

		//TODO:edit here

	}

	onInitDone()
	{
		super.onInitDone()
        this.data = this.getContainer().data;

        console.log("data==",this.data);
        this.itmsNm.setText(this.data.itmsNm);
        this.mrktCtg.setText(this.data.mrktCtg);
        this.srtnCd.setText(this.data.srtnCd);
		//TODO:edit here

	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

	}


	onCloseBtnClick(comp, info, e)
	{
        this.getContainer().close();
	}
}

