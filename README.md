<h1>프로젝트 설명</h1>
    
  <h2>1. 사용 API</h2>
  <ul>
      <li>공공데이터포털의 <code>openAPI</code> 사용</li>
      <li>금융위원회_KRX상장종목정보 사용</li>
  </ul>

  <h2>2. 통신방법</h2>
  <p>자유 (서버 구축 없음, <code>스파이더젠</code>만 사용)</p>

  <h2>3. 버전</h2>
  <p><code>4.1.3</code></p>

  <h2>4. 기능</h2>
  
  <h3>1) 종목조회</h3>
  <ul>
      <li>조회조건: <code>종목코드</code>, <code>종목명</code> (2개만)</li>
      <li>종목코드는 <code>단축코드 (likeSrtnCd)</code>를 의미</li>
      <li>종목명 (<code>likeItmsNm</code>)은 포함</li>
  </ul>
    
  <h3>2) 관심그룹</h3>
  <ul>
      <li>그룹 추가, 삭제, 그룹명 변경 가능</li>
      <li>그룹 최소 1개 존재 (<code>Default: 관심그룹001</code>)</li>
  </ul>
    
  <h3>3) 관심종목</h3>
  <ul>
      <li>관심종목 추가, 삭제, 여러 개 삭제, 전체 삭제</li>
  </ul>
    
  <h3>4) 데이터</h3>
  <ul>
      <li><code>localStorage</code>로 관리</li>
      <li>
          관리 데이터:
          <ul>
              <li>기준일자: <code>basDt</code></li>
              <li>종목명: <code>itmsNm</code></li>
              <li>시장구분: <code>mrktCtg</code></li>
              <li>ISIN코드: <code>isinCd</code></li>
              <li>법인명: <code>corpNm</code></li>
              <li>법인등록번호: <code>crno</code></li>
              <li>단축코드: <code>srtnCd</code></li>
          </ul>
      </li>
  </ul>

---


  <h3>피드백</h3>
  <p>코드 작성 시, 이벤트와 로직을 따로 작성하는 것이 불편할 수도 있음. 하지만 정답은 없으며, 경우에 따라 그렇게 작성하는 것이 더 편할 수도 있음.</p>
