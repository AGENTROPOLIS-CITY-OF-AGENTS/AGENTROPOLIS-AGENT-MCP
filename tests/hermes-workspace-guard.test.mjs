import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateHermesWorkspacePreflight } from '../src/hermes-workspace-guard.js';
const now = 1791576000000;
const req = (x = {}) => ({request_id:'req-1',actor_id:'alice',workspace_id:'tenant-a',resource_id:'doc-1',action:'bot.execute',action_digest:'digest-1',mandate_id:'mandate-1',envelope_id:'envelope-1',credential_ref:'cred-1',...x});
const mock = (x = {}) => ({
 resolveIdentity:async()=>({verified:true,actor_id:'alice',credential_ref:'cred-1',role:'operator',expires_at:now+60000}),
 checkWorkspace:async()=>({verified:true,allowed:true,actor_id:'alice',workspace_id:'tenant-a',resource_id:'doc-1'}),
 evaluateAegis:async()=>({verdict:'ALLOW',actor_id:'alice',workspace_id:'tenant-a',action_digest:'digest-1',mandate_id:'mandate-1',envelope_id:'envelope-1',policy_version:'v1'}),
 verifyContainment:async()=>({verified:true,test_double:false,actor_id:'alice',workspace_id:'tenant-a',action_digest:'digest-1',proof_ref:'proof-1',expires_at:now+60000}),
 verifyApproval:async()=>({verified:true,actor_id:'alice',action_digest:'digest-1',expires_at:now+60000}),
 verifyBudget:async()=>({verified:true,actor_id:'alice',action_digest:'digest-1',max_credits:0,expires_at:now+60000}),
 persistReceipt:async()=>({persisted:true,receipt_id:'receipt-1'}),
 ...x
});
const run=(r=req(),p=mock())=>evaluateHermesWorkspacePreflight(r,p,now);
test('preflight success never invokes tool',async()=>{const x=await run();assert.equal(x.decision,'ALLOW_PREFLIGHT');assert.equal(x.invocation_performed,false);});
test('viewer may not operate',async()=>{const x=await run(req(),mock({resolveIdentity:async()=>({verified:true,actor_id:'alice',credential_ref:'cred-1',role:'viewer',expires_at:now+60000})}));assert.equal(x.reason,'IDENTITY_OR_ROLE_DENIED');});
test('client authority forgery denied',async()=>{for(const key of ['role','attestation','authority_decision','authorization_receipt']){assert.equal((await run(req({[key]:'admin'}))).reason,'CALLER_SUPPLIED_AUTHORITY');}});
test('cross-tenant denied',async()=>{assert.equal((await run(req({workspace_id:'tenant-b'}))).reason,'TENANCY_DENIED');});
test('bot scope denied',async()=>{assert.equal((await run(req({bot_id:'other-bot'}))).reason,'TENANCY_DENIED');});
test('revoked credential denied',async()=>{assert.equal((await run(req(),mock({resolveIdentity:async()=>({verified:false,actor_id:'alice',credential_ref:'cred-1',role:'operator',expires_at:now+60000})}))).reason,'IDENTITY_OR_ROLE_DENIED');});
test('expired credential denied',async()=>{assert.equal((await run(req(),mock({resolveIdentity:async()=>({verified:true,actor_id:'alice',credential_ref:'cred-1',role:'operator',expires_at:now})}))).reason,'IDENTITY_OR_ROLE_DENIED');});
test('AEGIS scope mismatch denied',async()=>{assert.equal((await run(req(),mock({evaluateAegis:async()=>({verdict:'ALLOW',actor_id:'alice',workspace_id:'tenant-a',action_digest:'wrong',mandate_id:'mandate-1',envelope_id:'envelope-1',policy_version:'v1'})}))).reason,'AEGIS_DENIED');});
test('test double containment denied',async()=>{assert.equal((await run(req(),mock({verifyContainment:async()=>({verified:true,test_double:true,actor_id:'alice',workspace_id:'tenant-a',action_digest:'digest-1',proof_ref:'proof-1',expires_at:now+60000})}))).reason,'CONTAINMENT_DENIED');});
test('browser charges require verified budget',async()=>{for(const action of ['browser.search','browser.fetch','browser.navigate','browser.agent']){assert.equal((await run(req({action}),mock({verifyBudget:async()=>({verified:false})}))).reason,'BUDGET_DENIED');}});
test('plugin install requires administrative role',async()=>{assert.equal((await run(req({action:'plugin.install'}))).reason,'IDENTITY_OR_ROLE_DENIED');});
test('untrusted or offline providers fail closed',async()=>{assert.equal((await run(req(),{})).reason,'VERIFIER_UNAVAILABLE');assert.equal((await run(req(),mock({persistReceipt:async()=>{throw Error('offline')}}))).reason,'RECEIPT_UNAVAILABLE');});
