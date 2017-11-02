package com.eventure.requests;

import com.eventure.entities.Category;
import com.eventure.exceptions.UnauthorizedException;
import com.fasterxml.jackson.databind.util.ISO8601DateFormat;
import org.springframework.data.util.Pair;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

/**
 * Request specifying what filters to apply to an event search.
 */
public class FilterEventsRequest {
	private static final DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	private static final DateFormat parser = new ISO8601DateFormat();

	private String searchTerm;
	private Integer searchUserId;
	private Boolean myEventsOnly;
	private Boolean savedEventsOnly;
	private Boolean pastEventsOnly;

	private String startDate;
	private String endDate;

	private Float latitude;
	private Float longitude;
	private Float radius;

	private Category category;
	private Float priceMax;
	
	private Integer page;

	public FilterEventsRequest() {
	}

	public Integer getSearchUserId() {
		return searchUserId;
	}

	public void setSearchUserId(Integer searchUserId) {
		this.searchUserId = searchUserId;
	}

	public String getSearchTerm() {
		return searchTerm;
	}

	public void setSearchTerm(String searchTerm) {
		this.searchTerm = searchTerm;
	}

	public Boolean getMyEventsOnly() {
		return myEventsOnly;
	}

	public void setMyEventsOnly(Boolean myEventsOnly) {
		this.myEventsOnly = myEventsOnly;
	}

	public Boolean getSavedEventsOnly() {
		return savedEventsOnly;
	}

	public void setSavedEventsOnly(Boolean savedEventsOnly) {
		this.savedEventsOnly = savedEventsOnly;
	}
	
	public Boolean getPastEventsOnly() {
		return pastEventsOnly;
	}
	
	public void setPastEventsOnly(Boolean pastEventsOnly) {
		this.pastEventsOnly = pastEventsOnly;
	}

	public String getStartDate() {
		return startDate;
	}

	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	public String getEndDate() {
		return endDate;
	}

	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}

	public Float getLatitude() {
		return latitude;
	}

	public void setLatitude(Float latitude) {
		this.latitude = latitude;
	}

	public Float getLongitude() {
		return longitude;
	}

	public void setLongitude(Float longitude) {
		this.longitude = longitude;
	}

	public Float getRadius() {
		return radius;
	}

	public void setRadius(Float radius) {
		this.radius = radius;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public Float getPriceMax() {
		return priceMax;
	}

	public void setPriceMax(Float priceMax) {
		this.priceMax = priceMax;
	}
	
	public Integer getPage() {
		return page;
	}
	
	public void setPage(Integer page) {
		this.page = page;
	}

	/**
	 * Convert filter settings to an SQL query.
	 *
	 * @param userId the user performing the query.
	 * @return Pair containing the SQL string and a HashMap of variables to inject.
	 */
	public Pair<String, HashMap<String, Object>> toSql(Integer userId) throws ParseException {
		String sql = "select e.* from event_table e";
		ArrayList<String> conditions = new ArrayList<>();
		HashMap<String, Object> params = new HashMap<>();

		if (searchTerm != null && !searchTerm.isEmpty()) {
			sql += " inner join user u on e.creator_id = u.id";
			conditions.add("(lower(e.name) like :searchTerm or lower(e.description) like :searchTerm "
					+ "or lower(e.location_address) like :searchTerm or lower(e.location_name) like :searchTerm "
					+ "or lower(u.name) like :searchTerm)");
			params.put("searchTerm", "%" + searchTerm.toLowerCase() + "%");
		}
		if (myEventsOnly != null && myEventsOnly) {
			if (userId == null) {
				throw new UnauthorizedException("User must be logged in to see their created events.");
			}
			conditions.add("e.creator_id = :creator_id");
			params.put("creator_id", userId);
		}
		if (savedEventsOnly != null && savedEventsOnly) {
			if (userId == null) {
				throw new UnauthorizedException("User must be logged in to see their saved events.");
			}
			sql += " inner join save s on e.id = s.event_id";
			conditions.add("s.user_id = :user_id");
			params.put("user_id", userId);
		}
		if (pastEventsOnly != null && pastEventsOnly) {
			conditions.add("e.start_time < :currentDate");
			params.put("currentDate", dateFormat.format(new Date()));
		}
		if (startDate != null && !startDate.isEmpty()) {
			conditions.add("e.start_time >= :startDate");
			params.put("startDate", dateFormat.format(parser.parse(startDate)));
		} else if (pastEventsOnly == null || !pastEventsOnly){
			conditions.add("e.start_time >= :currentDate");
			params.put("currentDate", dateFormat.format(new Date()));
		}
		if (searchUserId != null) {
			conditions.add(String.format("e.creator_id = %s", searchUserId));
		}
		if (endDate != null && !endDate.isEmpty()) {
			conditions.add("e.end_time <= :endDate");
			params.put("endDate", dateFormat.format(parser.parse(endDate)));
		}
		if (latitude != null && longitude != null && radius != null) {
			// code for distance between lat/long points derived using the spherical law of cosines
			// found on <http://www.movable-type.co.uk/scripts/latlong.html>.
			conditions.add("(6371 * acos( sin(radians(e.latitude)) * sin(radians(:latitude))"
					+ " + cos(radians(e.latitude)) * cos(radians(:latitude))"
					+ " * cos(radians(:longitude) - radians(e.longitude)) ) <= :radius)");
			params.put("latitude", latitude);
			params.put("longitude", longitude);
			params.put("radius", radius);
		}
		if (category != null) {
			conditions.add("e.category = :category");
			params.put("category", category.name());
		}
		if (priceMax != null) {
			conditions.add("e.price <= :priceMax");
			params.put("priceMax", priceMax);
		}

		if (!conditions.isEmpty()) {
			sql += " where " + String.join(" and ", conditions);
		}

		return Pair.of(sql + " order by start_time asc", params);
	}
}
