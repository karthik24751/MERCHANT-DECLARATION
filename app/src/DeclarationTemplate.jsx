import React from 'react';
import './declaration.css';

const Blank = ({ children, minWidth = '200px' }) => (
  <span className="blank-field" style={{ minWidth }}>
    {children}
  </span>
);

const Checkbox = ({ checked }) => (
  <span className={`checkbox-box ${checked ? 'checked' : ''}`}></span>
);

export const DeclarationTemplate = React.forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} className="pdf-container">
      {/* PAGE 1 */}
      <div className="pdf-page">
        {data.businessName && (
          <div className="pdf-header">
            <div className="pdf-business-name">{data.businessName}</div>
            <div className="pdf-header-details">
              <div>Regd Office: {data.regAddress}</div>
              <div>Phone: {data.mobile}</div>
              <div>Email: {data.email}</div>
            </div>
          </div>
        )}

        <h2 style={{ textAlign: 'center', fontSize: '16px', marginBottom: '20px' }}>Merchant Declaration</h2>

        <p>To,</p>
        <p>PhonePe Limited (Formerly known as 'PhonePe Private Limited' ) ( hereinafter referred as "PhonePe" )<br/>
        Office-2, Floor 5, Wing A, Block A, Salarpuria Softzone,<br/>
        Bellandur Village, Varthur Hobli, Outer Ring Road, Bangalore South,<br/>
        Bangalore, Karnataka, India, 560103</p>

        <p style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '20px' }}>Subject: PhonePe Merchant Declaration</p>

        <p style={{ lineHeight: '2' }}>
          I, <Blank minWidth="250px">{data.name}</Blank> [NAME], hereinafter referred to as <strong>"Merchant"</strong> being the,
          <br/>
          <Blank minWidth="300px">{data.designation}</Blank> [AUTHORISED DESIGNATION] &lt;Owner / Karta / Partner/ Director / Managing Director / Authorised Signatory &gt; of the
          <br/>
          <Blank minWidth="400px">{data.businessName}</Blank> [BUSINESS NAME] &lt;Firm name / Company name&gt; having its &lt;registered office&gt; address at
          <br/>
          <Blank minWidth="400px">{data.regAddress}</Blank> [ADDRESS] (<strong>"Entity"</strong>) and having its &lt;principal place of operation/office&gt; at same <Checkbox checked={data.addressLogic === 'same'}/> (tick if applicable) OR <Blank minWidth="350px">{data.addressLogic === 'different' ? data.opAddress : ''}</Blank>
          <br/>
          [ADDRESS], do hereby declare that I have been authorised, to act as a designated authorised signatory for the Entity (including, but not limited to, registration/execution/renewal/amendment of the business related association(s)/partnership(s)/contract(s)/terms and conditions with PhonePe) and that the below mentioned details provided by me (including my specimen signature) are true, accurate, valid, legally binding and authenticated for the Entity, and can be used the purposes of obtaining payment facilitation services, business related associations / partnership(s) with PhonePe.
        </p>

        <p>I hereby allow PhonePe, to collect, store and use my KYC and/or other details as required by PhonePe, for the purposes of verifying my identity as the authorised signatory of the entity thereby, enabling the entity, to be onboarded as Merchant with PhonePe for the purposes of availing PhonePe services, in accordance with PhonePe’s Terms and Conditions and Privacy Policy.</p>

        <p style={{ fontWeight: 'bold', marginTop: '20px' }}>Details provided under this declaration:</p>
        <ol style={{ lineHeight: '2' }}>
          <li>Mobile No. (registered with PhonePe for Onboarding): <Blank minWidth="200px">{data.mobile}</Blank></li>
          <li>Email ID (registered with PhonePe for Onboarding): <Blank minWidth="250px">{data.email}</Blank></li>
          <li>Individual KYC Documents:</li>
          <li>In case of Person with Disability (PwD), please specify
            <div style={{ marginLeft: '20px' }}>
              Type of Disability: <Blank minWidth="200px">{data.disabilityType || 'N/A'}</Blank>
              <br/>
              Percentage of Disability: <Blank minWidth="200px">{data.disabilityPercentage || 'N/A'}</Blank>
            </div>
          </li>
          <li>Father’s Name (of the Authorized Signatory) <Blank minWidth="250px">{data.fatherName}</Blank></li>
        </ol>
      </div>

      {/* PAGE 2 */}
      <div className="pdf-page">
        <ul style={{ listStyleType: 'none', paddingLeft: 0, lineHeight: '2' }}>
          <li>PAN CARD (Mandatory) <span style={{float: 'right', marginRight: '100px'}}><Checkbox checked={data.kycPan} /></span></li>
        </ul>
        <p style={{ fontStyle: 'italic' }}>Any one of the following is mandatory (Please tick whichever submitted):</p>
        <ul style={{ listStyleType: 'disc', marginLeft: '20px', lineHeight: '2' }}>
          <li>Aadhaar (masked except the last 4 digits) <span style={{float: 'right', marginRight: '100px'}}><Checkbox checked={data.kycDoc === 'aadhaar'} /></span></li>
          <li>Driving License <span style={{float: 'right', marginRight: '100px'}}><Checkbox checked={data.kycDoc === 'dl'} /></span></li>
          <li>Voter ID <span style={{float: 'right', marginRight: '100px'}}><Checkbox checked={data.kycDoc === 'voterid'} /></span></li>
        </ul>

        <p style={{ marginTop: '20px' }}>I hereby declare that the above information/ details provided herein are true, valid and accurate as on date of submission and further that I would be liable for any incorrect/false information or for any untrue statement of details / information provided.</p>

        <table className="pdf-table">
          <tbody>
            <tr>
              <td style={{ width: '30%', fontWeight: 'bold' }}>Signature with seal:</td>
              <td style={{ textAlign: 'center', height: '60px' }}>
                 {data.signature1 && <img src={data.signature1} className="signature-img" alt="sig"/>}
                 {data.seal1 && <img src={data.seal1} className="seal-img" alt="seal"/>}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Name:</td>
              <td style={{ textAlign: 'center' }}>{data.name}</td>
            </tr>
          </tbody>
        </table>

        <p>I, on behalf of the Merchant, further declare that:</p>

        <table className="pdf-table">
          <tbody>
            <tr>
              <td style={{ width: '85%' }}>
                <p>The below in the entity duly registered under the applicable law of lands:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', lineHeight: '2' }}>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'individual'} /> Individual/Sole proprietorship</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'huf'} /> HUF</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'company'} /> Company</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'trust'} /> Trust</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'registered_partnership'} /> Registered Partnership Firm</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'society'} /> Society</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'unregistered_partnership'} /> Un-Registered Partnership Firm</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'others'} /> Others (Club, University, Institution etc.)</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'body_of_individual'} /> Body of individual</div>
                  <div style={{ width: '50%' }}><Checkbox checked={data.entityType === 'association_of_person'} /> Association of Person</div>
                  <div style={{ width: '100%' }}><Checkbox checked={data.entityType === 'govt'} /> Government Departments / Public Sector Undertaking / Local Government Bodies (Municipal Corporations, Gram Panchayats etc.)</div>
                </div>
              </td>
              <td style={{ width: '15%', textAlign: 'center' }}>Tick (as applicable)</td>
            </tr>
            <tr>
              <td>
                1. The Merchant is registered under Income Tax Act, 1961 (as may be amended from time to time) and has obtained TAN Number <Blank minWidth="150px">{data.tanOption === 'has_tan' ? data.tanNumber : ''}</Blank> against the registration. <strong>OR</strong>
              </td>
              <td style={{ textAlign: 'center' }}><Checkbox checked={data.tanOption === 'has_tan'} /></td>
            </tr>
            <tr>
              <td>The Merchant does not hold TAN as it is not liable to deduct tax at source or collect tax at source as per the provisions of Income Tax Act, 1961.</td>
              <td style={{ textAlign: 'center' }}>Tick (if applicable)<br/><Checkbox checked={data.tanOption === 'no_tan'} /></td>
            </tr>
            <tr>
              <td>
                2. The Merchant is registered and a GSTIN certificate/acknowledgement having provisional number <Blank minWidth="200px">{data.gstOption === 'has_gst' ? data.gstNumber : ''}</Blank> is issued by GST authorities. <strong>OR</strong>
              </td>
              <td style={{ textAlign: 'center' }}><Checkbox checked={data.gstOption === 'has_gst'} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PAGE 3 */}
      <div className="pdf-page">
        <table className="pdf-table" style={{ marginTop: 0 }}>
          <tbody>
            <tr>
              <td style={{ width: '85%' }}>The Merchant does not have any registration with GST authorities.</td>
              <td style={{ width: '15%', textAlign: 'center' }}>Tick (if applicable)<br/><Checkbox checked={data.gstOption === 'no_gst'} /></td>
            </tr>
            <tr>
              <td>
                <p>The entity is working in the nature of:</p>
                <div style={{ lineHeight: '2' }}>
                  <div><Checkbox checked={data.natureOfEntity === 'govt_org'} /> Government organization</div>
                  <div><Checkbox checked={data.natureOfEntity === 'ngo'} /> NGO/Charitable institution</div>
                  <div><Checkbox checked={data.natureOfEntity === 'na'} /> NA</div>
                </div>
              </td>
              <td style={{ textAlign: 'center' }}>Tick (as applicable)</td>
            </tr>
            <tr>
              <td>No personnel, director, officer, any family member or close associate of the Merchant and its beneficial owners, is a Politically Exposed Person (PEP) (as defined by RBI).</td>
              <td style={{ textAlign: 'center' }}>Tick (as applicable)<br/><Checkbox checked={data.pep === 'no'} /></td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: '20px' }}>
          I, having PAN number <Blank minWidth="150px">{data.panNumber}</Blank>, hereby declare that the above facts and information are true, complete and correct to the best of my knowledge. I understand and agree that in case it is found that the above-mentioned facts and information are incorrect, I will be personally held liable for the same.
        </p>

        <table className="pdf-table" style={{ marginTop: '30px' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', padding: '15px' }}>
                <p>Yours faithfully,</p>
                <p>For and behalf of the Merchant</p>
                <div style={{ height: '60px', marginTop: '10px' }}>
                  {data.signatureFinal && <img src={data.signatureFinal} className="signature-img" style={{ float: 'left' }} alt="sig" />}
                  {data.sealFinal && <img src={data.sealFinal} className="seal-img" style={{ float: 'left', marginLeft: '10px' }} alt="seal" />}
                </div>
                <p>(Signature with Seal)</p>
                <p>Designation: {data.designation}</p>
                <p>Date: {data.date}</p>
                <p>Place: {data.place}</p>
              </td>
              <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'middle' }}>
                {data.picture && <img src={data.picture} className="profile-img" alt="profile" />}
                <p style={{ marginTop: '10px', fontSize: '10px' }}>Picture of the Authorised Signatory<br/>(Countersign with face visible)</p>
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontWeight: 'bold', marginTop: '20px' }}>Note:</p>
        <ol style={{ fontSize: '10px', fontStyle: 'italic', paddingLeft: '15px' }}>
          <li>“Government company” means any company in which not less than fifty-one percent of the paid-up share capital is held by the Central Government, or by any State Government or Governments, or partly by the Central Government and partly by one or more State Governments, and includes a company which is a subsidiary company of such a Government company.</li>
          <li>NGO (For Darpan applicability)</li>
        </ol>
      </div>
    </div>
  );
});
