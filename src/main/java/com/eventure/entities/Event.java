package com.eventure.entities;

import org.springframework.data.annotation.Id;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.Date;
import java.util.Locale;

/**
 * Entity representing an event, tied to the EventTable table in the database.
 */
@Entity
@Table(name = "event_table")
@SequenceGenerator(name = "sequence_generator", sequenceName = "event_id_seq")
public class Event {
	@Id
	@javax.persistence.Id
	@GeneratedValue(generator = "sequence_generator")
	@Column(name = "id")
	private Integer id;

	@ManyToOne
	@JoinColumn(name = "creator_id")
	private User creator;

	@Column(name = "name")
	private String name;

	@Column(name = "description")
	private String description;

	@Column(name = "start_time")
	private Date startTime;

	@Column(name = "end_time")
	private Date endTime;

	@Column(name = "category")
	@Enumerated(EnumType.STRING)
	private Category category;

	@Column(name = "price")
	private Float price;

	@Column(name = "longitude")
	private float longitude;

	@Column(name = "latitude")
	private float latitude;
	
	@Column(name = "locality")
	private String locality;

	@Column(name = "maps_url")
	private String mapsUrl;

	@Column(name = "location_name")
	private String locationName;
	
	@Column(name = "location_address")
	private String locationAddress;

	@Column(name = "link")
	private String link;

	@Column(name = "image_url")
	private String imageUrl;

	// Start time in a human readable format
	@Transient
	private String timeString;

	// ID of the Save object linking this event and the requesting user.
	@Transient
	private Integer saved;

	public Event() {
	}

	public Event(User creator, String name, String description, Date startTime, Date endTime, Category category,
			Float price, float longitude, float latitude, String mapsUrl, String locationName, String locationAddress, String link, String imageUrl) {
		super();
		this.creator = creator;
		this.name = name;
		this.description = description;
		this.startTime = startTime;
		this.endTime = endTime;
		this.category = category;
		this.price = price;
		this.longitude = longitude;
		this.latitude = latitude;
		this.mapsUrl = mapsUrl;
		this.locationName = locationName;
		this.locationAddress = locationAddress;
		this.link = link;
		this.imageUrl = imageUrl;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public User getCreator() {
		return creator;
	}

	public void setCreator(User creator) {
		this.creator = creator;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public Float getPrice() {
		return price;
	}

	public void setPrice(Float price) {
		this.price = price;
	}

	public float getLongitude() {
		return longitude;
	}

	public void setLongitude(float longitude) {
		this.longitude = longitude;
	}

	public float getLatitude() {
		return latitude;
	}

	public void setLatitude(float latitude) {
		this.latitude = latitude;
	}
	
	public String getLocality() {
		return locality;
	}

	public void setLocality(String locality) {
		this.locality = locality;
	}

	public String getMapsUrl() {
		return mapsUrl;
	}

	public void setMapsUrl(String mapsUrl) {
		this.mapsUrl = mapsUrl;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public String getLocationAddress() {
		return locationAddress;
	}

	public void setLocationAddress(String locationAddress) {
		this.locationAddress = locationAddress;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Integer getSaved() {
		return saved;
	}

	public void setSaved(Integer saved) {
		this.saved = saved;
	}

	public String getTimeString() {
		// Note that toInstant already converts the time to the system time
		// zone, so the localdatetime zone is set to GMT.
		LocalDateTime start = LocalDateTime.ofInstant(startTime.toInstant(), ZoneId.of("Etc/GMT"));
		LocalDateTime end = LocalDateTime.ofInstant(endTime.toInstant(), ZoneId.of("Etc/GMT"));

		String startTime = toTimeString(start);
		String endTime = toTimeString(end);

		return startTime + " to " + endTime + " " + start.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
				+ " " + start.getDayOfMonth() + " " + start.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
				+ " " + start.getYear();
	}

	private static String toTimeString(LocalDateTime time) {
		int hour = time.getHour();
		String suffix = hour < 12 ? "am" : "pm";
		if (hour == 0)
			hour = 12;
		else if (hour > 12)
			hour -= 12;

		int min = time.getMinute();
		String minString = String.valueOf(min);
		if (min < 10) {
			minString = "0" + minString;
		}

		return hour + ":" + minString + suffix;
	}
}
