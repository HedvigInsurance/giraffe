import {Claim, ClaimOutcome, ClaimStatus, QueryResolvers} from "../generated/graphql";
import {ClaimDto, ClaimOutcomeDto, ClaimStatusDto} from "../api/upstreams/claimService";
import {LocalizedStrings} from "../translations/LocalizedStrings";

const statusMap = {
  [ClaimStatusDto.CREATED]: ClaimStatus.Submitted,
  [ClaimStatusDto.IN_PROGRESS]: ClaimStatus.BeingHandled,
  [ClaimStatusDto.CLOSED]: ClaimStatus.Closed,
  [ClaimStatusDto.REOPENED]: ClaimStatus.Reopened,
}

const outcomeMap = {
  [ClaimOutcomeDto.PAID]: ClaimOutcome.Paid,
  [ClaimOutcomeDto.NOT_COMPENSATED]: ClaimOutcome.NotCompensated,
  [ClaimOutcomeDto.NOT_COVERED]: ClaimOutcome.NotCompensated,
}

export const claims: QueryResolvers['claims'] = async (
  _parent,
  _args,
  {upstream, strings},
): Promise<Claim[]> => {
  let claims : ClaimDto[] = await upstream.claimService.getMemberClaims()

  claims = claims.filter(o => (!_args.status || _args.status.includes(statusMap[o.status])) && // TODO refine?
    (!_args.outcome || _args.outcome?.includes(outcomeMap[o.outcome as ClaimOutcomeDto])));

  return claims.map((c) => transformClaim(c, strings))
}

const transformClaim = (
  claim: ClaimDto, strings: LocalizedStrings
): Claim => {
  return <Claim>{
    id: claim.id,
    status: statusMap[claim.status],
    outcome: claim.outcome ? outcomeMap[claim.outcome] : undefined,
    outcomeText: claim.outcome ? strings(outcomeMap[claim.outcome]) : undefined,
    contractId: claim.contractId,
    type: claim.type,
    payout: claim.payout,
    submittedAt: claim.registrationDate,
    closedAt: claim.closedAt,
    files: claim.files
  }
}
